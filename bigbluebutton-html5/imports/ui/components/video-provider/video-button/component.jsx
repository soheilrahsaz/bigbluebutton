import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';

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
  videoButtonDesc: {
    id: 'app.video.videoButtonDesc',
    description: 'video button description',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
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
  isSharingVideo: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  handleJoinVideo: PropTypes.func.isRequired,
  handleCloseVideo: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  isSharingVideo,
  isDisabled,
  handleJoinVideo,
  handleCloseVideo,
  notify,
  validIOSVersion,
}) => {
	
  //added for Hamkelasi
  const btn = React.createRef();
  const hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
	
  const verifyIOS = () => {
    if (!validIOSVersion()) {
      return notify(
        intl.formatMessage(intlMessages.iOSWarning),
        'error',
        'warning',
      );
    }
	
	//added for Hamkelasi
	let maxAllowedVideos = hamkelasiParams && hamkelasiParams.maxallowedvideos ? hamkelasiParams.maxallowedvideos : -1;
	if(maxAllowedVideos >= 0)
	{
		let verificationTimeout = setTimeout(() => {
			btn.current.blink(false);
		}, 20000);
		
		btn.current.blink(true, intl.formatMessage(intlMessages.verificationInProgressLabel));
		  
		let url = decodeURIComponent(hamkelasiParams.url)+'?host='+hamkelasiParams.host+'&meetingId='+hamkelasiParams.meetingid+'&action=getVideoCount';
		
		if (btn.current.isBlinking()) {
		  return notify(
			intl.formatMessage(intlMessages.verificationInProgressWarning),
			'warning',
			'warning',
			  );
		}
		
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
					handleJoinVideo();
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
		handleJoinVideo();
	}
  };

  const sharingVideoLabel = isSharingVideo
    ? intl.formatMessage(intlMessages.leaveVideo) : intl.formatMessage(intlMessages.joinVideo);

  const disabledLabel = isDisabled
    ? intl.formatMessage(intlMessages.videoLocked) : sharingVideoLabel;

  return (
    <Button
      ref={btn}
      label={disabledLabel}
      className={cx(styles.button, isSharingVideo || styles.btn)}
      onClick={isSharingVideo ? handleCloseVideo : verifyIOS}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
      color={isSharingVideo ? 'primary' : 'default'}
      icon={isSharingVideo ? 'video' : 'video_off'}
      ghost={!isSharingVideo}
      size="lg"
      circle
      disabled={isDisabled}
    />
  );
};

JoinVideoButton.propTypes = propTypes;
export default injectIntl(memo(JoinVideoButton));
