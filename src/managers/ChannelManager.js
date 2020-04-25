'use strict';

const BaseManager = require('./BaseManager');
const Channel = require('../structures/Channel');
const { Events } = require('../util/Constants');

/**
 * 클라이언트에 귀속된 채널 매니저
 * @extends {BaseManager}
 */
class ChannelManager extends BaseManager {
  constructor(client, iterable) {
    super(client, iterable, Channel);
  }

  /**
   * 채널들의 캐시
   * @type {Collection<Snowflake, Channel>}
   * @name ChannelManager#cache
   */

  add(data, guild, cache = true) {
    const existing = this.cache.get(data.id);
    if (existing) {
      if (existing._patch && cache) existing._patch(data);
      if (guild) guild.channels.add(existing);
      return existing;
    }

    const channel = Channel.create(this.client, data, guild);

    if (!channel) {
      this.client.emit(Events.DEBUG, `Failed to find guild, or unknown type for channel ${data.id} ${data.type}`);
      return null;
    }

    if (cache) this.cache.set(channel.id, channel);

    return channel;
  }

  remove(id) {
    const channel = this.cache.get(id);
    if (channel.guild) channel.guild.channels.cache.delete(id);
    this.cache.delete(id);
  }

  /**
   * 채널 객체로 리졸브 가능한 데이터. 가능한 데이터:
   * * A Channel object
   * * A Snowflake
   * @typedef {Channel|Snowflake} ChannelResolvable
   */

  /**
   * Resolves a ChannelResolvable to a Channel object.
   * @method resolve
   * @memberof ChannelManager
   * @instance
   * @param {ChannelResolvable} channel The channel resolvable to resolve
   * @returns {?Channel}
   */

  /**
   * Resolves a ChannelResolvable to a channel ID string.
   * @method resolveID
   * @memberof ChannelManager
   * @instance
   * @param {ChannelResolvable} channel The channel resolvable to resolve
   * @returns {?Snowflake}
   */

  /**
   * Obtains a channel from Discord, or the channel cache if it's already available.
   * @param {Snowflake} id ID of the channel
   * @param {boolean} [cache=true] Whether to cache the new channel object if it isn't already
   * @returns {Promise<Channel>}
   * @example
   * // Fetch a channel by its id
   * client.channels.fetch('222109930545610754')
   *   .then(channel => console.log(channel.name))
   *   .catch(console.error);
   */
  async fetch(id, cache = true) {
    const existing = this.cache.get(id);
    if (existing && !existing.partial) return existing;

    const data = await this.client.api.channels(id).get();
    return this.add(data, null, cache);
  }
}

module.exports = ChannelManager;
