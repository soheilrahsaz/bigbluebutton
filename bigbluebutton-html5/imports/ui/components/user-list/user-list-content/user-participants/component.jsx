import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import { notify } from '/imports/ui/services/notification';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import { makeCall } from '/imports/ui/services/api';

//added for Hamkelasi
import getFromUserSettings from '/imports/ui/services/users-settings';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  userRaisedHandNotif: {
    id: 'app.userList.userRaisedHandNotif',
    description: 'User raised hand message',
  },
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserParticipants extends Component {
  constructor() {
    super();

    this.state = {
      selectedUser: null,
	  userFilter: null,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
	
	//added for Hamkelasi
	this.raisedHandUsers = null;
	this.kickedOutUsers = [];
	this.invisibleUsers = ['superadmin'];
	this.hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
	if(this.hamkelasiParams && typeof this.hamkelasiParams.invisibleusers != "undefined" && Array.isArray(this.hamkelasiParams.invisibleusers))
	{
		this.invisibleUsers = this.invisibleUsers.concat(this.hamkelasiParams.invisibleusers);
	}
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser === prevState.selectedUser) return;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (firstChild) firstChild.focus();
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  getUsers() {
    const {
	  intl,
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;

    // Changed for Hamkelasi
    if (currentUser.role === ROLE_MODERATOR) {
		const isFirstLoad = this.raisedHandUsers === null;
		if (isFirstLoad) {
			this.raisedHandUsers = [];
		}
	  
		// avoid multiple joins
		if(this.hamkelasiParams && (typeof this.hamkelasiParams.allowmultiplejoin == "undefined" || !this.hamkelasiParams.allowmultiplejoin))
		{
			let uniqueNonModeratorUsers = {};
			users.filter(user => user.role !== ROLE_MODERATOR && this.kickedOutUsers.indexOf(user.extId) == -1).forEach((user) => {
				
				let i = user.extId.lastIndexOf("_");
				if(i > 0)
				{
					let currentUsername = user.extId.substring(0, i);
					i = user.extId.substring(i+1);
					
					if(uniqueNonModeratorUsers.hasOwnProperty(currentUsername))
					{
						let user2kickout = null;
						if(uniqueNonModeratorUsers[currentUsername]['id'] < i)
						{
							user2kickout = {extId: uniqueNonModeratorUsers[currentUsername].extId, userId: uniqueNonModeratorUsers[currentUsername].userId};
							uniqueNonModeratorUsers[currentUsername] = {id: i, extId: user.extId, userId: user.userId};
						}
						else
						{
							user2kickout = user;
						}
						console.log('kicking out '+user2kickout.extId);
						
						makeCall('removeUser', user2kickout.userId, false/*banUser*/);
						this.kickedOutUsers.push(user2kickout.extId);
					}
					else
					{
						uniqueNonModeratorUsers[currentUsername] = {id: i, extId: user.extId, userId: user.userId};
					}
				}
			});
		}
		
		users.filter(user => currentUser.userId != user.userId).forEach((user) => {
			
			// handle new raise hands
			const i = this.raisedHandUsers.indexOf(user.userId);
			if (user.emoji == 'raiseHand') {
			  if (i == -1) {
				this.raisedHandUsers.push(user.userId);

				if (!isFirstLoad) {
				  notify(
					  intl.formatMessage(intlMessages.userRaisedHandNotif, { 0: user.name }),
					  'info', 'hand', {onClose: (e) => {
						  
						  /*const userLocked = user.locked && user.role !== ROLE_MODERATOR;
						  if(userLocked)
						  {//unlock user
							  makeCall('toggleUserLock', user.userId, false/*lockStatus* /);
						  }*/
					  }}
				  );
				}
			  }
			} else if (i >= 0) {
				this.raisedHandUsers.splice(i, 1);
			}
			//return user;
		});
    }
	
    let index = -1;
	
	//Changed for Hamkelasi
    return users.
	filter(u => (currentUser.userId.toLowerCase().startsWith('superadmin_') || u.userId == currentUser.userId || !this.invisibleUsers.find(iu => u.extId.toLowerCase().startsWith(iu+'_'))) && (!this.state.userFilter || u.name.toLowerCase().includes(this.state.userFilter)) && !this.kickedOutUsers.find(ku => ku == u.extId)).
	sort(function(u1, u2) {
		
		if(u1.userId == currentUser.userId) {
			return -1;
		}
		if(u2.userId == currentUser.userId) {
			return 1;
		}
		if(u1.role == ROLE_MODERATOR && u2.role !== ROLE_MODERATOR)
		{
			return -1;
		}
		if(u1.role !== ROLE_MODERATOR && u2.role == ROLE_MODERATOR)
		{
			return 1;
		}
		if (u1.emoji == 'raiseHand' && u2.emoji != 'raiseHand') {
			return -1;
		}
		if (u1.emoji != 'raiseHand' && u2.emoji == 'raiseHand') {
			return 1;
		}
		return 0;
	}).
	map(u => (
      <CSSTransition
        classNames={listTransition}
        appear
        enter
        exit
        timeout={0}
        component="div"
        className={cx(styles.participantsList)}
        key={u.userId}
      >
        <div ref={(node) => { this.userRefs[index += 1] = node; }}>
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
            }}
            user={u}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </div>
      </CSSTransition>
    ));
  }

  handleClickSelectedUser(event) {
	if(event.target.getAttribute('ishamkelasiicon') == 'true')
	{//prevent click override of internal Hamkelasi added icons
		return;
	}
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.className && p.className.includes('participantsList'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser } = this.state;
    const usersItemsRef = findDOMNode(this.refScrollItems);
    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }

  changeFilter(filter) {
	this.setState({ userFilter: filter ? filter.toLowerCase() : null });
  }

  render() {
    const {
      intl,
      users,
      compact,
      setEmojiStatus,
      currentUser,
      meetingIsBreakout,
    } = this.props;

	//Changed for Hamkelasi	
    return (
      <div className={styles.userListColumn}>
        {
          !compact
            ? (
              <div className={styles.container}>
                <h2 className={styles.smallTitle}>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  &nbsp;(
                  {users.filter(u =>  u.userId == currentUser.userId || !this.invisibleUsers.find(iu => u.extId.toLowerCase().startsWith(iu+'_'))).length}
                  )
                </h2>
                {currentUser.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      setEmojiStatus,
                      meetingIsBreakout,
                    }}
                    />
                  ) : null
                }

              </div>
            )
            : <hr className={styles.separator} />
        }
		<div className={styles.userSearchBoxContainer}>
			<input type="text" className={styles.userSearchBox} placeholder="جستجو" onChange={(e) => this.changeFilter(e.target.value)}/>
		</div>
        <div
          className={styles.scrollableList}
          tabIndex={0}
          ref={(ref) => { this.refScrollContainer = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this.refScrollItems = ref; }}>
              {this.getUsers()}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
