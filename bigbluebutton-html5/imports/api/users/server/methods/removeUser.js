import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import BannedUsers from '/imports/api/users/server/store/bannedUsers';

export default function removeUser(userId, banUser) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';

    const { meetingId, requesterUserId: ejectedBy } = extractCredentials(this.userId);

    check(meetingId, String);
    check(ejectedBy, String);
    check(userId, String);
    check(banUser, Boolean);

    const payload = {
      userId,
      ejectedBy,
      banUser,
    };
	
	const removedUser = Users.findOne({ meetingId, userId }, { extId: 1 });
	
	if (banUser && removedUser) 
	{
	  BannedUsers.add(meetingId, removedUser.extId);
	  //Added for hamkelasi
	  if(removedUser.extId.match(/^.+(_[0-9]+)$/g))
	  {
		  let extId = removedUser.extId.split('_');
		  extId.pop();
		  extId = extId.join('_');
		  //ban user after removing _num suffix from external id
		  BannedUsers.add(meetingId, extId);
	  }
  }

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ejectedBy, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method removeUser ${err.stack}`);
  }
}
