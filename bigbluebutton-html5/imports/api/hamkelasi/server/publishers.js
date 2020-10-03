import { HamkelasiAction } from '/imports/api/hamkelasi';
import { Meteor } from 'meteor/meteor';

import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';


function hamkelasiAction(requesteeUserId) {
  if (!this.userId) {
    return HamkelasiAction.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug(`Publishing hamkelasi-action for ${meetingId} from ${requesterUserId} to ${requesteeUserId}`);

  const selector = {
    meetingId,
    requesterUserId,
    requesteeUserId,
  };

  const options = {
    fields: {
      action: true,
	  meetingId: true,
      requesterUserId: true,
      requesteeUserId: true,
    }
  };

  return HamkelasiAction.find(selector, options);
}

function pubishHamkelasiAction(...args) {
  const boundHamkelasiAction = hamkelasiAction.bind(this);
  return boundHamkelasiAction(...args);
}

Meteor.publish('hamkelasi-action', pubishHamkelasiAction);
