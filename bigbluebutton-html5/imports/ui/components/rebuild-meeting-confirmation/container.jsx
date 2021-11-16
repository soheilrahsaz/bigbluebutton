import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RebuildMeetingComponent from './component';
import Service from './service';
import logger from '/imports/startup/client/logger';

const RebuildMeetingContainer = props => <RebuildMeetingComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },

  rebuildMeeting: () => {
    logger.warn({
      logCode: 'moderator_forcing_end_meeting',
      extraInfo: { logType: 'user_action' },
    }, 'this user clicked on EndMeeting and confirmed, removing everybody from the meeting');
    //makeCall('rebuildMeeting');
    mountModal(null);
  },
  meetingTitle: Service.getMeetingTitle(),
  users: Service.getUsers(),
}))(RebuildMeetingContainer));
