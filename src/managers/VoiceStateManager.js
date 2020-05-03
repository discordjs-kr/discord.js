'use strict';

const BaseManager = require('./BaseManager');
const VoiceState = require('../structures/VoiceState');

/**
 * 음성 상태의 API 메소드를 관리하고 캐시에 저장합니다.
 * @extends {BaseManager}
 */
class VoiceStateManager extends BaseManager {
  constructor(guild, iterable) {
    super(guild.client, iterable, VoiceState);
    /**
     * 이 매니저에 귀속된 길드
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * 이 매니저에 귀속된 음성 상태 캐시
   * @type {Collection<Snowflake, VoiceState>}
   * @name VoiceStateManager#cache
   */

  add(data, cache = true) {
    const existing = this.cache.get(data.user_id);
    if (existing) return existing._patch(data);

    const entry = new VoiceState(this.guild, data);
    if (cache) this.cache.set(data.user_id, entry);
    return entry;
  }
}

module.exports = VoiceStateManager;
