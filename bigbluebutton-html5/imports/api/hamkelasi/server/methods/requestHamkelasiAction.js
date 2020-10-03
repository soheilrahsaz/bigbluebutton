import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';


export default function requestHamkelasiAction(requesteeUserId, action) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RequestHamkelasiActionCmdMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(requesteeUserId, String);
  //check(action, Object);

  const payload = {
    requesteeUserId,
    action: typeof action === 'string' ? action : JSON.stringify(action),
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
