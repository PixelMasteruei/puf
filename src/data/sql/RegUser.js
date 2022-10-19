/**
 *
 * This is the database of the data for registered Users
 *
 */

import Sequelize, { DataTypes, QueryTypes } from 'sequelize';

import sequelize from './sequelize';
import { generateHash } from '../../utils/hash';
import { USERLVL } from '../../core/constants';

export { USERLVL } from '../../core/constants';


const RegUser = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  email: {
    type: DataTypes.CHAR(40),
    allowNull: true,
    unique: true,
  },

  name: {
    type: `${DataTypes.CHAR(32)} CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    allowNull: false,
  },

  /*
   * if account is private,
   * exclude it from statistics etc.
   */
  priv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  // null if only ever used external oauth
  password: {
    type: DataTypes.CHAR(60),
    allowNull: true,
  },

  userlvl: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: USERLVL.REGISTERED,
  },

  // currently just moderator TODO Delete
  roles: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },

  // if account is mail verified TODO Delete
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  // currently just blockDm
  blocks: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },

  // TODO Delete, replaced by ThreePID table
  discordid: {
    type: DataTypes.CHAR(20),
    allowNull: true,
  },

  // TODO Delete, replaced by ThreePID table
  redditid: {
    type: DataTypes.CHAR(10),
    allowNull: true,
  },

  // when mail verification got requested,
  // used for purging unverified accounts
  verificationReqAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,

  getterMethods: {
    blockDm() {
      return this.blocks & 0x01;
    },
  },

  setterMethods: {
    blockDm(num) {
      const val = (num) ? (this.blocks | 0x01) : (this.blocks & ~0x01);
      this.setDataValue('blocks', val);
    },

    password(value) {
      if (value) this.setDataValue('password', generateHash(value));
    },
  },

});

export async function name2Id(name) {
  try {
    const userq = await sequelize.query(
      'SELECT id FROM Users WHERE name = $1',
      {
        bind: [name],
        type: QueryTypes.SELECT,
        raw: true,
        plain: true,
      },
    );
    return userq.id;
  } catch {
    return null;
  }
}

export async function findIdByNameOrId(searchString) {
  let id = await name2Id(searchString);
  if (id) {
    return { name: searchString, id };
  }
  id = parseInt(searchString, 10);
  if (!Number.isNaN(id)) {
    const user = await RegUser.findByPk(id, {
      attributes: ['name'],
      raw: true,
    });
    if (user) {
      return { name: user.name, id };
    }
  }
  return null;
}

export async function getNamesToIds(ids) {
  const idToNameMap = new Map();
  if (!ids.length || ids.length > 300) {
    return idToNameMap;
  }
  try {
    const result = await RegUser.findAll({
      attributes: ['id', 'name'],
      where: {
        id: ids,
      },
      raw: true,
    });
    result.forEach((obj) => {
      idToNameMap.set(obj.id, obj.name);
    });
  } catch {
    // nothing
  }
  return idToNameMap;
}

/*
 * take array of objects that include user ids and add
 * user informations if user is not private
 * @param rawRanks array of {id: userId, ...} objects
 */
export async function populateIdObj(rawRanks) {
  if (!rawRanks.length) {
    return rawRanks;
  }
  const uids = rawRanks.map((r) => r.id);
  const userData = await RegUser.findAll({
    attributes: [
      'id',
      'name',
      [
        Sequelize.fn(
          'DATEDIFF',
          Sequelize.literal('CURRENT_TIMESTAMP'),
          Sequelize.col('createdAt'),
        ),
        'age',
      ],
    ],
    where: {
      id: uids,
      priv: false,
    },
    raw: true,
  });
  for (const { id, name, age } of userData) {
    const dat = rawRanks.find((r) => r.id === id);
    if (dat) {
      dat.name = name;
      dat.age = age;
    }
  }
  return rawRanks;
}

export default RegUser;
