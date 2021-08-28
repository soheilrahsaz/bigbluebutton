import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import Settings from '/imports/ui/services/settings';
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
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserParticipants extends Component {
  constructor() {
    super();

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      keyMapper: () => 1,
    });

    this.state = {
      selectedUser: null,
      isOpen: false,
      scrollArea: false,
	  userFilter: null,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
	this.changeFilter = this.changeFilter.bind(this);
	this.invisibleUsers = ['superadmin'];
	this.hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
	
	if(this.hamkelasiParams && typeof this.hamkelasiParams.invisibleusers != "undefined" && Array.isArray(this.hamkelasiParams.invisibleusers))
	{
		this.invisibleUsers = this.invisibleUsers.concat(this.hamkelasiParams.invisibleusers);
	}
	this.filteredUsers = [];
	this.kickedOutUsers = [];
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

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (!firstChild.isEqualNode(document.activeElement)) {
        firstChild.focus();
      }
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  rowRenderer({
    index,
    parent,
    style,
    key,
  }) {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { scrollArea } = this.state;
    const user = this.filteredUsers[index];
    const isRTL = Settings.application.isRTL;

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={key}
          id={`user-${user.userId}`}
        >
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
              scrollArea,
              isRTL,
            }}
            user={user}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </span>
      </CellMeasurer>
    );
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
    const { selectedUser, scrollArea } = this.state;
    const usersItemsRef = findDOMNode(scrollArea.firstChild);

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
      clearAllEmojiStatus,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { isOpen, scrollArea } = this.state;
	
	 if (currentUser.role === ROLE_MODERATOR) 
	 {
		// avoid multiple joins
		if(this.hamkelasiParams && (typeof this.hamkelasiParams.allowmultiplejoin == "undefined" || !this.hamkelasiParams.allowmultiplejoin))
		{
			let uniqueNonModeratorUsers = {};
			users.filter(user => user.role !== ROLE_MODERATOR && this.kickedOutUsers.indexOf(user.extId) == -1).forEach((user) => 
			{
				
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
		
    }
	
	//added for hamkelasi
	this.filteredUsers = users.filter(u => (currentUser.userId.toLowerCase().startsWith('superadmin_') 
									|| u.userId == currentUser.userId || !this.invisibleUsers.find(iu => u.extId.toLowerCase().startsWith(iu+'_'))) 
									&& (!this.state.userFilter || u.name.toLowerCase().includes(this.state.userFilter)) 
									&& !this.kickedOutUsers.find(ku => ku == u.extId))
								.sort(function(u1, u2) {
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
								});
								
	
	let filteredUsersTemp = this.filteredUsers;

    return (
      <div className={styles.userListColumn}>
        {
          !compact
            ? (
              <div className={styles.container}>
                <h2 className={styles.smallTitle}>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  &nbsp;(
                  {users.filter(u => (currentUser.userId.toLowerCase().startsWith('superadmin_') 
									|| u.userId == currentUser.userId || !this.invisibleUsers.find(iu => u.extId.toLowerCase().startsWith(iu+'_'))) 
									&& !this.kickedOutUsers.find(ku => ku == u.extId)).length}
                  )
                </h2>
                {currentUser.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      filteredUsersTemp,
                      clearAllEmojiStatus,
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
          className={styles.virtulizedScrollableList}
          tabIndex={0}
          ref={(ref) => {
            this.refScrollContainer = ref;
          }}
        >
          <span id="participants-destination" />
          <AutoSizer>
            {({ height, width }) => (
              <List
                {...{
                  isOpen,
                  filteredUsersTemp,
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;
                  }

                  if (ref !== null && !scrollArea) {
                    this.setState({ scrollArea: findDOMNode(ref) });
                  }
                }}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                rowCount={this.filteredUsers.length}
                height={height - 1}
                width={width - 1}
                className={styles.scrollStyle}
                overscanRowCount={30}
                deferredMeasurementCache={this.cache}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
