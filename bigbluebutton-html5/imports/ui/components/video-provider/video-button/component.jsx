import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import VideoService from '../service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';
import { validIOSVersion } from '/imports/ui/components/app/service';
import { notify } from '/imports/ui/services/notification';

//Added for Hamkelasi
import getFromUserSettings from '/imports/ui/services/users-settings';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
  videoConnecting: {
    id: 'app.video.connecting',
    description: 'video connecting label',
  },
  dataSaving: {
    id: 'app.video.dataSaving',
    description: 'video data saving label',
  },
  meteorDisconnected: {
    id: 'app.video.clientDisconnected',
    description: 'Meteor disconnected label',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
  maxAllowedVideosReached: {
    id: 'app.video.maxAllowedVideosReached',
    description: 'maximum allowed videos has reached',
  },
  verificationInProgressLabel: {
    id: 'app.video.verificationInProgressLabel',
    description: 'verification in progress label',
  },
  verificationInProgressWarning: {
    id: 'app.video.verificationInProgressWarning',
    description: 'verification in progress warning',
  },
  serviceCallError: {
    id: 'app.video.serviceCallError',
    description: 'service call error',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  mountVideoPreview: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  disableReason,
  mountVideoPreview,
}) => {
	
  //added for Hamkelasi
  const btn = React.createRef();
  const hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
	
  const exitVideo = () => hasVideoStream && !VideoService.isMultipleCamerasEnabled();

  const handleOnClick = () => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }
	
    if (exitVideo()) {
      VideoService.exitVideo();
	  return;
    }
	
	//added for Hamkelasi
	//let maxAllowedVideos = hamkelasiParams && hamkelasiParams.maxallowedvideos ? hamkelasiParams.maxallowedvideos : -1;
	//if(maxAllowedVideos >= 0)
	if(hamkelasiParams)
	{
		if (btn.current.isBlinking()) {
		  return notify(
				intl.formatMessage(intlMessages.verificationInProgressWarning),
				'warning',
				'warning',
			);
		}
	
		let verificationTimeout = setTimeout(() => {
			btn.current.blink(false);
		}, 20000);
		
		btn.current.blink(true, intl.formatMessage(intlMessages.verificationInProgressLabel));
		  
		let url = decodeURIComponent(hamkelasiParams.url)+'?host='+hamkelasiParams.host+'&meetingId='+hamkelasiParams.meetingid+'&action=getVideoCount';		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
			
			if (verificationTimeout) {
			  clearTimeout(verificationTimeout);
			  verificationTimeout = null;
			}
			btn.current.blink(false);
			
			if (xhr.status == 200 && xhr.response.status == 0) {
				//document.querySelectorAll('video').length
				if(xhr.response.result)
				{
					mountVideoPreview();
				}
				else
				{
					return notify(
						intl.formatMessage(intlMessages.maxAllowedVideosReached),
						'error',
						'warning',
					  );
				}
			} else {
				return notify(
					intl.formatMessage(intlMessages.serviceCallError),
					'error',
					'warning',
				  );
			}
		};
		xhr.send();
	}
	else
	{
		mountVideoPreview();
	}
  };

  let label = exitVideo()
    ? intl.formatMessage(intlMessages.leaveVideo)
    : intl.formatMessage(intlMessages.joinVideo);

  if (disableReason) label = intl.formatMessage(intlMessages[disableReason]);

  return (
    <Button
      ref={btn}
      label={label}
      className={cx(styles.button, hasVideoStream || styles.btn)}
      onClick={handleOnClick}
      hideLabel
      color={hasVideoStream ? 'primary' : 'default'}
      icon={hasVideoStream ? 'video' : 'video_off'}
      ghost={!hasVideoStream}
      size="lg"
      circle
      disabled={!!disableReason}
    />
  );
};

JoinVideoButton.propTypes = propTypes;

export default injectIntl(memo(JoinVideoButton));
