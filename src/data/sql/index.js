import sequelize from './sequelize';
import Whitelist from './Whitelist';
import RegUser, { USERLVL } from './RegUser';
import Channel from './Channel';
import UserChannel from './UserChannel';
import Message from './Message';
import UserBlock from './UserBlock';
import IPInfo from './IPInfo';
import WhoisRange from './WhoisRange';
import UserIP from './UserIP';
import ThreePID, { THREEP } from './ThreePID';

/*
 * User Channel access
 */
RegUser.belongsToMany(Channel, {
  as: 'channel',
  through: UserChannel,
});
Channel.belongsToMany(RegUser, {
  as: 'user',
  through: UserChannel,
});

/*
 * ip informations of user
 */
IPInfo.belongsToMany(RegUser, {
  through: UserIP,
  foreignKey: 'ip',
});
RegUser.belongsToMany(IPInfo, {
  through: UserIP,
  foreignKey: 'uid',
});

/*
 * third party ids for oauth login
 */
RegUser.hasMany(ThreePID, {
  as: 'tp',
  foreignKey: {
    name: 'uid',
    allowNull: false,
  },
  onDelete: 'CASCADE',
});
ThreePID.belongsTo(RegUser);

/*
 * whois range for ip
 */
WhoisRange.hasMany(IPInfo, {
  as: 'whois',
  foreignKey: 'wid',
});
IPInfo.belongsTo(WhoisRange);

/*
 * chat messages
 */
Message.belongsTo(Channel, {
  as: 'channel',
  foreignKey: 'cid',
  onDelete: 'CASCADE',
});
Message.belongsTo(RegUser, {
  as: 'user',
  foreignKey: 'uid',
  onDelete: 'CASCADE',
});

/*
 * User blocks of other user
 *
 * uid: User that blocks
 * buid: User that is blocked
 */
RegUser.belongsToMany(RegUser, {
  as: 'blocked',
  through: UserBlock,
  foreignKey: 'uid',
});
RegUser.belongsToMany(RegUser, {
  as: 'blockedBy',
  through: UserBlock,
  foreignKey: 'buid',
});

/*
 * includes for RegUsert
 * that should be available on ordinary
 * login
 */
const regUserQueryInclude = [{
  model: Channel,
  as: 'channel',
  include: [{
    model: RegUser,
    as: 'dmu1',
    foreignKey: 'dmu1id',
    attributes: ['id', 'name'],
  }, {
    model: RegUser,
    as: 'dmu2',
    foreignKey: 'dmu2id',
    attributes: ['id', 'name'],
  }],
}, {
  association: 'blocked',
  attributes: ['id', 'name'],
}];

export {
  regUserQueryInclude,
  Whitelist,
  RegUser,
  Channel,
  UserChannel,
  Message,
  UserBlock,
  WhoisRange,
  IPInfo,
  ThreePID,
  USERLVL,
  THREEP,
};
