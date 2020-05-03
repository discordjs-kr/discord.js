'use strict';

const BaseManager = require('./BaseManager');
const GuildMember = require('../structures/GuildMember');
const Message = require('../structures/Message');
const User = require('../structures/User');

/**
 * 유저의 API 메소드를 관리하고 캐시에 저장합니다.
 * @extends {BaseManager}
 */
class UserManager extends BaseManager {
  constructor(client, iterable) {
    super(client, iterable, User);
  }

  /**
   * 이 매니저에 귀속된 유저 캐시
   * @type {Collection<Snowflake, User>}
   * @name UserManager#cache
   */

  /**
   * 유저 객체로 리졸브 가능한 데이터. 가능한 데이터:
   * * 유저 객체
   * * Snowflake
   * * 메세지 객체 (message.author로 리졸브합니다)
   * * 서버 유저 객체
   * @typedef {User|Snowflake|Message|GuildMember} UserResolvable
   */

  /**
   * 유저로 리졸브 가능한 데이터를 유저 객체 데이터로 리졸브합니다.
   * @param {UserResolvable} user 리졸브 할 유저 데이터
   * @returns {?User}
   */
  resolve(user) {
    if (user instanceof GuildMember) return user.user;
    if (user instanceof Message) return user.author;
    return super.resolve(user);
  }

  /**
   * 유저로 리졸브 가능한 데이터를 유저 ID 문자열로 리졸브합니다.
   * @param {UserResolvable} user 리졸브 할 유저 데이터
   * @returns {?Snowflake}
   */
  resolveID(user) {
    if (user instanceof GuildMember) return user.user.id;
    if (user instanceof Message) return user.author.id;
    return super.resolveID(user);
  }

  /**
   * 유저를 캐시에 있다면 캐시에서, 캐시에 없다면 디스코드에서 불러옵니다.
   * @param {Snowflake} id 유저 ID
   * @param {boolean} [cache=true] 새로운 유저의 캐싱 여부
   * @returns {Promise<User>}
   */
  async fetch(id, cache = true) {
    const existing = this.cache.get(id);
    if (existing && !existing.partial) return existing;
    const data = await this.client.api.users(id).get();
    return this.add(data, cache);
  }
}

module.exports = UserManager;
