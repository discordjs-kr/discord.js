'use strict';

const BaseManager = require('./BaseManager');
const Role = require('../structures/Role');
const Permissions = require('../util/Permissions');
const { resolveColor } = require('../util/Util');

/**
 * 역할의 API 메소드를 관리하고 캐시에 저장합니다.
 * @extends {BaseManager}
 */
class RoleManager extends BaseManager {
  constructor(guild, iterable) {
    super(guild.client, iterable, Role);
    /**
     * 이 매니저에 귀속된 길드
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * 이 매니저에 귀속된 역할 캐시
   * @type {Collection<Snowflake, Role>}
   * @name RoleManager#cache
   */

  add(data, cache) {
    return super.add(data, cache, { extras: [this.guild] });
  }

  /**
   * 역할을 캐시에 있다면 캐시에서, 캐시에 없다면 디스코드에서 불러옵니다.
   * @param {Snowflake} [id] 역할 또는 역할들의 ID
   * @param {boolean} [cache=true] 새로운 역할들의 캐싱 여부
   * @returns {Promise<Role|RoleManager>}
   * @example
   * // 길드의 모든 역할을 불러옵니다
   * message.guild.roles.fetch()
   *   .then(roles => console.log(`이 길드에는 ${roles.cache.size}개의 역할이 있습니다.`))
   *   .catch(console.error);
   * @example
   * // 한 역할을 불러옵니다
   * message.guild.roles.fetch('222078108977594368')
   *   .then(role => console.log(`이 역할의 색깔은 ${role.color}입니다.`))
   *   .catch(console.error);
   */
  async fetch(id, cache = true) {
    if (id) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    // We cannot fetch a single role, as of this commit's date, Discord API throws with 405
    const roles = await this.client.api.guilds(this.guild.id).roles.get();
    for (const role of roles) this.add(role, cache);
    return id ? this.cache.get(id) || null : this;
  }

  /**
   * 역할 객체로 리졸브 가능한 데이터. 가능한 데이터:
   * * 역할 클래스
   * * Snowflake
   * @typedef {Role|Snowflake} RoleResolvable
   */

  /**
   * 역할로 리졸브 가능한 데이터를 역할 객체 데이터로 리졸브합니다.
   * @method resolve
   * @memberof RoleManager
   * @instance
   * @param {RoleResolvable} role 리졸브 할 역할 데이터
   * @returns {?Role}
   */

  /**
   * 역할로 리졸브 가능한 데이터를 역할 ID 문자열로 리졸브합니다.
   * @method resolveID
   * @memberof RoleManager
   * @instance
   * @param {RoleResolvable} role 리졸브 할 역할 데이터
   * @returns {?Snowflake}
   */

  /**
   * 옵션에 따른 새로운 역할을 생성합니다.
   * <warn>만약 올바르지 않은 역할 위치 데이터가 옵션으로 받아들여진다면 경고 없이 1로 설정합니다.</warn>
   * @param {Object} [options] 옵션
   * @param {RoleData} [options.data] 역할의 데이터
   * @param {string} [options.reason] 역할을 생성하는 이유
   * @returns {Promise<Role>}
   * @example
   * // 새로운 역할을 생성합니다
   * guild.roles.create()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // 데이터와 이유로 역할을 생성합니다
   * guild.roles.create({
   *   data: {
   *     name: '당근을 흔들어주세요',
   *     color: 'ORANGE',
   *   },
   *   reason: '마감러들을 위한 당근을!',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  create({ data = {}, reason } = {}) {
    if (data.color) data.color = resolveColor(data.color);
    if (data.permissions) data.permissions = Permissions.resolve(data.permissions);

    return this.guild.client.api
      .guilds(this.guild.id)
      .roles.post({ data, reason })
      .then(r => {
        const { role } = this.client.actions.GuildRoleCreate.handle({
          guild_id: this.guild.id,
          role: r,
        });
        if (data.position) return role.setPosition(data.position, reason);
        return role;
      });
  }

  /**
   * 길드의 `@everyone` 역할
   * @type {Role}
   * @readonly
   */
  get everyone() {
    return this.cache.get(this.guild.id);
  }

  /**
   * 캐시에 있는 가장 높은 역할
   * @type {Role}
   * @readonly
   */
  get highest() {
    return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), this.cache.first());
  }
}

module.exports = RoleManager;
