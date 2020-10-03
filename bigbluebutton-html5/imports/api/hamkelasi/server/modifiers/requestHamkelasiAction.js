import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { HamkelasiAction } from '/imports/api/hamkelasi';

export default function requestHamkelasiAction(meetingId, requesterUserId, requesteeUserId, action) {
  check(meetingId, String);
  check(requesterUserId, String);
  check(requesteeUserId, String);
  check(action, Object);

  const selector = {
    meetingId,
    requesterUserId,
    requesteeUserId,
  };
  
  const mod = {
    meetingId,
    requesterUserId,
    requesteeUserId,
    action,
    time: (new Date()),
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`HamkelasiAction update error: ${err}`);
    }
	
    return Logger.debug(`HamkelasiAction update for requesterUserId={${requesterUserId}} requesteeUserId={${requesteeUserId}}`);
  };

  return HamkelasiAction.upsert(selector, mod, cb);
}
