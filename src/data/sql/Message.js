/*
 *
 * Database layout for Chat Message History
 *
 */

import Sequelize, { DataTypes } from 'sequelize';
import sequelize from './sequelize';
import Channel from './Channel';
import RegUser from './RegUser';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  flag: {
    type: DataTypes.CHAR(2),
    defaultValue: 'xx',
    allowNull: false,
  },

  message: {
    type: `${DataTypes.CHAR(200)} CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    allowNull: false,
  },
}, {
  updatedAt: false,

  setterMethods: {
    message(value) {
      this.setDataValue('message', value.slice(0, 200));
    },
  },
});

export async function storeMessage(
  flag,
  message,
  cid,
  uid,
) {
  await Channel.update({
    lastMessage: Sequelize.literal('CURRENT_TIMESTAMP'),
  }, {
    where: {
      id: cid,
    },
  });
  return Message.create({
    flag,
    message,
    cid,
    uid,
  });
}

export async function getMessagesForChannel(cid, limit) {
  const models = await Message.findAll({
    attributes: [
      'message',
      'uid',
      'flag',
      [
        Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('createdAt')),
        'ts',
      ],
    ],
    include: {
      association: 'user',
      attributes: ['name'],
    },
    where: { cid },
    limit,
    order: [['createdAt', 'DESC']],
    raw: true,
  });
  return models.map((model) => {
    const {
      [user.name]: name,
      message,
      flag,
      uid,
      ts,
    } = model;
    return [name, message, flag, uid, ts];
  });
}

export default Message;
