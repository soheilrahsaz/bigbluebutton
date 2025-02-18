import React, { Component } from 'react';
import browserInfo from '/imports/utils/browserInfo';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import cx from 'classnames';
import BBBMenu from '/imports/ui/components/menu/component';
import Icon from '/imports/ui/components/icon/component';
import FullscreenService from '/imports/ui/components/fullscreen-button/service';
import FullscreenButtonContainer from '/imports/ui/components/fullscreen-button/container';
import { styles } from '../styles';
import VideoService from '../../service';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import deviceInfo from '/imports/utils/deviceInfo';
import { ACTIONS } from '/imports/ui/components/layout/enums';

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class VideoListItem extends Component {
  constructor(props) {
    super(props);
    this.videoTag = null;

    this.state = {
      videoIsReady: false,
      isFullscreen: false,
      isStreamHealthy: false,
    };

    this.mirrorOwnWebcam = VideoService.mirrorOwnWebcam(props.userId);

    this.setVideoIsReady = this.setVideoIsReady.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.onStreamStateChange = this.onStreamStateChange.bind(this);
    this.updateOrientation = this.updateOrientation.bind(this);
  }

  componentDidMount() {
    const { onVideoItemMount, cameraId } = this.props;

    onVideoItemMount(this.videoTag);
    this.videoTag.addEventListener('loadeddata', this.setVideoIsReady);
    this.videoContainer.addEventListener('fullscreenchange', this.onFullscreenChange);
    subscribeToStreamStateChange(cameraId, this.onStreamStateChange);
    window.addEventListener('resize', this.updateOrientation);
  }

  componentDidUpdate() {
    const playElement = (elem) => {
      if (elem.paused) {
        elem.play().catch((error) => {
          // NotAllowedError equals autoplay issues, fire autoplay handling event
          if (error.name === 'NotAllowedError') {
            const tagFailedEvent = new CustomEvent('videoPlayFailed', { detail: { mediaTag: elem } });
            window.dispatchEvent(tagFailedEvent);
          }
        });
      }
    };

    // This is here to prevent the videos from freezing when they're
    // moved around the dom by react, e.g., when  changing the user status
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=382879
    if (this.videoTag) {
      playElement(this.videoTag);
    }
  }

  componentWillUnmount() {
    const {
      cameraId,
      onVideoItemUnmount,
      isFullscreenContext,
      layoutContextDispatch,
    } = this.props;

    this.videoTag.removeEventListener('loadeddata', this.setVideoIsReady);
    this.videoContainer.removeEventListener('fullscreenchange', this.onFullscreenChange);
    unsubscribeFromStreamStateChange(cameraId, this.onStreamStateChange);
    onVideoItemUnmount(cameraId);
    window.removeEventListener('resize', this.updateOrientation);

    if (isFullscreenContext) {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
    }
  }

  onStreamStateChange(e) {
    const { streamState } = e.detail;
    const { isStreamHealthy } = this.state;

    const newHealthState = !isStreamStateUnhealthy(streamState);
    e.stopPropagation();

    if (newHealthState !== isStreamHealthy) {
      this.setState({ isStreamHealthy: newHealthState });
    }
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const serviceIsFullscreen = FullscreenService.isFullScreen(this.videoContainer);

    if (isFullscreen !== serviceIsFullscreen) {
      this.setState({ isFullscreen: serviceIsFullscreen });
    }
  }

  setVideoIsReady() {
    const { videoIsReady } = this.state;
    if (!videoIsReady) this.setState({ videoIsReady: true });
    window.dispatchEvent(new Event('resize'));

    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */
    Session.set('canConnect', true);
  }

  getAvailableActions() {
    const {
      actions,
      cameraId,
      name,
    } = this.props;
    const MAX_WIDTH = 640;
    const fullWidthMenu = window.innerWidth < MAX_WIDTH;
    const menuItems = [];
    if (fullWidthMenu) menuItems.push({
      key: `${cameraId}-${name}`,
      label: name,
      onClick: () => {},
      disabled: true,
    })
    actions?.map((a, i) => {
        let topDivider = false;
        if (i === 0 && fullWidthMenu) topDivider = true;
        menuItems.push({
          key: `${cameraId}-${a?.actionName}`,
          label: a?.actionName,
          description: a?.description,
          onClick: a?.onClick,
          dividerTop: topDivider,
        });
    });
    return menuItems
  }

  updateOrientation() {
    this.setState({ isPortrait: deviceInfo.isPortrait() });
  }

  renderFullscreenButton() {
    const { name, cameraId } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        data-test="webcamsFullscreenButton"
        fullscreenRef={this.videoContainer}
        elementName={name}
        elementId={cameraId}
        elementGroup="webcams"
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  render() {
    const {
      videoIsReady,
      isStreamHealthy,
    } = this.state;
    const {
      name,
      voiceUser,
      numOfStreams,
      mirrored,
      isFullscreenContext,
    } = this.props;
    const availableActions = this.getAvailableActions();
    const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;
    const shouldRenderReconnect = !isStreamHealthy && videoIsReady;

    const { isFirefox } = browserInfo;

    return (
      <div
        data-test={voiceUser.talking ? 'webcamItemTalkingUser' : 'webcamItem'}
        className={cx({
          [styles.content]: true,
          [styles.talking]: voiceUser.talking,
          [styles.fullscreen]: isFullscreenContext,
        })}
      >
        {
          !videoIsReady
          && (
            <div
              data-test="webcamConnecting"
              className={cx({
                [styles.connecting]: true,
                [styles.content]: true,
                [styles.talking]: voiceUser.talking,
              })}
            >
              <span className={styles.loadingText}>{name}</span>
            </div>
          )

        }

        {
          shouldRenderReconnect
          && <div className={styles.reconnecting} />
        }

        <div
          className={styles.videoContainer}
          ref={(ref) => { this.videoContainer = ref; }}
        >
          <video
            muted
            data-test={this.mirrorOwnWebcam ? 'mirroredVideoContainer' : 'videoContainer'}
            className={cx({
              [styles.media]: true,
              [styles.mirroredVideo]: (this.mirrorOwnWebcam && !mirrored)
                || (!this.mirrorOwnWebcam && mirrored),
              [styles.unhealthyStream]: shouldRenderReconnect,
            })}
            ref={(ref) => { this.videoTag = ref; }}
            autoPlay
            playsInline
          />
          {videoIsReady && this.renderFullscreenButton()}
        </div>
        {videoIsReady
          && (
            <div className={styles.info}>
              {enableVideoMenu && availableActions.length >= 1
                ? (
                  <BBBMenu
                    trigger={<div className={styles.dropdownTrigger}><span>{name}</span></div>}
                    actions={this.getAvailableActions()}
                    opts={{
                      id: "default-dropdown-menu",
                      keepMounted: true,
                      transitionDuration: 0,
                      elevation: 3,
                      getContentAnchorEl: null,
                      fullwidth: "true",
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformorigin: { vertical: 'bottom', horizontal: 'left' },
                    }}
                  />                  
                )
                : (
                  <div className={isFirefox ? styles.dropdownFireFox
                    : styles.dropdown}
                  >
                    <span className={cx({
                      [styles.userName]: true,
                      [styles.noMenu]: numOfStreams < 3,
                    })}
                    >
                      {name}
                    </span>
                  </div>
                )}
              {voiceUser.muted && !voiceUser.listenOnly ? <Icon className={styles.muted} iconName="unmute_filled" /> : null}
              {voiceUser.listenOnly ? <Icon className={styles.voice} iconName="listen" /> : null}
              {voiceUser.joined && !voiceUser.muted ? <Icon className={styles.voice} iconName="unmute" /> : null}
            </div>
          )}
      </div>
    );
  }
}

export default VideoListItem;

VideoListItem.defaultProps = {
  numOfStreams: 0,
};

VideoListItem.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.object).isRequired,
  cameraId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  numOfStreams: PropTypes.number,
};
