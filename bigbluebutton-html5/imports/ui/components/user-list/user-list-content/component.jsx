import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles';
import UserParticipantsContainer from './user-participants/container';
import UserMessages from './user-messages/container';
import UserNotesContainer from './user-notes/container';
import UserCaptionsContainer from './user-captions/container';
import WaitingUsers from './waiting-users/component';
import UserPolls from './user-polls/component';
import ClassInfo from './class-info/component';
import HamkelasiInfo from './hamkelasi-info/component';
import BreakoutRoomItem from './breakout-room/component';

//Added for Hamkelasi
import getFromUserSettings from '/imports/ui/services/users-settings';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};
const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserContent extends PureComponent {
	
	constructor() {
		super();

		//added for Hamkelasi
		this.hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
  }
	
  render() {
    const {
      compact,
      intl,
      currentUser,
      setEmojiStatus,
      clearAllEmojiStatus,
      roving,
      isPublicChat,
      pollIsOpen,
      forcePollOpen,
      hasBreakoutRoom,
      pendingUsers,
      requestUserInformation,
      currentClosedChats,
      startedChats,
    } = this.props;

	const hamkelasiParams = this.hamkelasiParams;

    return (
      <div
        data-test="userListContent"
        className={styles.content}
      >
	  
	  { hamkelasiParams && typeof hamkelasiParams.classinfo != "undefined" && Array.isArray(hamkelasiParams.classinfo) && hamkelasiParams.classinfo.length ?
			(
				<ClassInfo 
				  {...{
					intl,
					compact,
					hamkelasiParams,
				  } }/>
			) : null
		}
		
		{ hamkelasiParams && typeof hamkelasiParams.hamkelasiinfo != "undefined" && Array.isArray(hamkelasiParams.hamkelasiinfo) && hamkelasiParams.hamkelasiinfo.length ?
			(
				<HamkelasiInfo 
				  {...{
					intl,
					compact,
					hamkelasiParams,
				  } }/>
			) : null
		}
	  
        {CHAT_ENABLED
          ? (<UserMessages
            {...{
              isPublicChat,
              compact,
              intl,
              roving,
              currentClosedChats,
              startedChats,
            }}
          />
          ) : null
        }
        {currentUser.role === ROLE_MODERATOR
          ? (
            <UserCaptionsContainer
              {...{
                intl,
              }}
            />
          ) : null
        }
        <UserNotesContainer
          {...{
            intl,
          }}
        />
        {pendingUsers.length > 0 && currentUser.role === ROLE_MODERATOR
          ? (
            <WaitingUsers
              {...{
                intl,
                pendingUsers,
              }}
            />
          ) : null
        }
        <UserPolls
          isPresenter={currentUser.presenter}
          {...{
            pollIsOpen,
            forcePollOpen,
          }}
        />
        <BreakoutRoomItem isPresenter={currentUser.presenter} hasBreakoutRoom={hasBreakoutRoom} />
        <UserParticipantsContainer
          {...{
            compact,
            intl,
            currentUser,
            setEmojiStatus,
            clearAllEmojiStatus,
            roving,
            requestUserInformation,
          }}
        />
      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
