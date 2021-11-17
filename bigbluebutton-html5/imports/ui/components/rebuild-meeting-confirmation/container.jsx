import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RebuildMeetingComponent from './component';
import Service from './service';
import logger from '/imports/startup/client/logger';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { notify } from '/imports/ui/services/notification';

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
	{
		const hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
		if(hamkelasiParams)
		{
			let url = decodeURIComponent(hamkelasiParams.url)
			+'?host='+hamkelasiParams.host+'&meetingId='+hamkelasiParams.meetingid+'&action=rebuildMeeting&hfw_SID='+hamkelasiParams.sid;

			var xhr = new XMLHttpRequest();
			xhr.open('POST', url, true);
			xhr.responseType = 'json';
			
			xhr.onload = function() 
			{
				if (xhr.status == 200)
				{
					if(xhr.response.status == 0)
					{
						//goodBye!
					}
					else
					{
						return notify(
							xhr.response.error,
							'error',
							'warning',
						  );
					}
				} else {
					return notify(
						'خطای دسترسی به اینترنت',
						'error',
						'warning',
					  );
				}
			};
			
			xhr.send();
		}
	}
	
    mountModal(null);
  },
  meetingTitle: Service.getMeetingTitle(),
  users: Service.getUsers(),
}))(RebuildMeetingContainer));
