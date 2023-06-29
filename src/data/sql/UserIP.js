/*
 *
 * Last IP and useragent a user connected with
 *
 */

import { DataTypes } from 'sequelize';
import sequelize from './sequelize';

const UserIP = sequelize.define('UserIP', {
  ua: {
    type: DataTypes.CHAR(200),
  },

  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  timestamps: false,

  setterMethods: {
    ua(value) {
      const URIencode = encodeURIComponent(value);
      this.setDataValue('ua', URIencode.slice(0, 200));
    },
  },
});

/*
 * save lastIp of user
 * @param uid userId
 * @param ip IP
 * @param ua UserAgent
 */
export function updateLastIp(uid, ip, ua) {
  return UserIP.upsert({
    uid,
    ip,
    ua,
    lastSeen: new Date().toISOString(),
  });
}

/*
 * update lastSeen
 */
export async function touch(uid, ip, ua) {
  try {
    const data = {
      lastSeen: new Date().toISOString(),
    };
    if (ua) {
      data.ua = ua;
    }
    await UserIP.update(data, {
      where: { uid, ip },
    });
  } catch {
    return false;
  }
  return true;
}

export default UserIP;
