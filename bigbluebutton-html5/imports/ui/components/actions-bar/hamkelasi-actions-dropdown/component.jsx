import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
//import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from '../styles';
//import ExternalVideoModal from '/imports/ui/components/external-video-player/modal/container';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

//added for Hamkelasi
import HamkelasiModal from '/imports/ui/components/modal/hamkelasi/hamkelasi-modal/component';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import getFromUserSettings from '/imports/ui/services/users-settings';
import UserSettings from '/imports/api/users-settings';

const propTypes = {
  intl: PropTypes.object.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  amIModerator: PropTypes.bool.isRequired,
  mountModal: PropTypes.func.isRequired,
  shortcuts: PropTypes.string,
  /*handleTakePresenter: PropTypes.func.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  stopExternalVideoShare: PropTypes.func.isRequired,*/
};

const defaultProps = {
  shortcuts: '',
};

const intlMessages = defineMessages({
  hamkelasiActionsLabel: {
    id: 'app.actionsBar.hamkelasiActionsDropdown.actionsLabel',
    description: 'Hamkelasi actions button label',
  },
  
  MangeGrades: {
    id: 'app.hamkelasi.userList.menu.manageGrades.label',
    description: 'Open grades manager modal',
  },
});

class HamkelasiActionsDropdown extends PureComponent {
  constructor(props) {
    super(props);
	
	//added for Hamkelasi
	this.hamkelasiParams = getFromUserSettings('hamkelasi_params', null);
	this.currentUser = Users.findOne({ userId: Auth.userID }, { fields: { approved: 1, emoji: 1, extId: 1, userId:1, role: 1, name: 1 } });
			
	this.handleClick = this.handleClick.bind(this);
    this.makeDropdownItem = this.makeDropdownItem.bind(this);
  }

  componentWillUpdate(nextProps) {
    const { amIPresenter: isPresenter } = nextProps;
    const { amIPresenter: wasPresenter, mountModal } = this.props;
    if (wasPresenter && !isPresenter) {
      mountModal(null);
    }
  }

  getAvailableActions() {
    const {
      intl,
      amIPresenter,
	  amIModerator,
	  isMeteorConnected,
    } = this.props;

    const {
      /*pollBtnLabel,
      pollBtnDesc,
      presentationLabel,
      presentationDesc,
      takePresenter,
      takePresenterDesc,*/
    } = intlMessages;

    const {
      formatMessage,
    } = intl;
	
	var actions = [];
	
	//added for Hamkelasi
	if(this.hamkelasiParams)
	{		
		if(isMeteorConnected)
		{
			var addActions = function(that, action) {
				
				actions.push(that.makeDropdownItem(
						action.action,
						action.title,
						() => that.handleClick(
						  <HamkelasiModal
							intl={intl}
							user={that.currentUser}
							mid={that.hamkelasiParams.meetingid}
							sid={that.hamkelasiParams.sid}
							host={that.hamkelasiParams.host}
							url={decodeURIComponent(that.hamkelasiParams.url)}
							action={action.action}
						  />,
						),
						action.icon,
					  ));
			};
			
			if(amIModerator)
			{
				if(typeof this.hamkelasiParams.generalactions != "undefined" && Array.isArray(this.hamkelasiParams.generalactions) && this.hamkelasiParams.generalactions.length > 0)
				{
					for(var action of this.hamkelasiParams.generalactions)
					{
						addActions(this, action);
					}
					//actions.push(<DropdownListSeparator key={_.uniqueId('list-separator-')} />);
				}
			}
		}
	}
	
	return actions;
  }
  
  handleClick(modal) {
    const { mountModal } = this.props;
    mountModal(modal);
  }
  
  makeDropdownItem(key, label, onClick, icon = null, iconRight = null) {
    const { getEmoji } = this.props;
    return (
      <DropdownListItem
        {...{
          key,
          label,
          onClick,
          icon,
          iconRight,
        }}
        className={key === getEmoji ? styles.emojiSelected : null}
        data-test={key}
      />
    );
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_ACTIONS_AK,
      isMeteorConnected,
    } = this.props;

    const availableActions = this.getAvailableActions();

    if (availableActions.length === 0 || !isMeteorConnected) {
      return null;
    }

    return (
      <Dropdown ref={(ref) => { this._dropdown = ref; }}>
        <DropdownTrigger tabIndex={0} accessKey={OPEN_ACTIONS_AK}>
          <Button
            hideLabel
            aria-label={intl.formatMessage(intlMessages.hamkelasiActionsLabel)}
            className={styles.hamkelasiButton}
            label={intl.formatMessage(intlMessages.hamkelasiActionsLabel)}
            icon="rastak-hamkelasi"
            size="lg"
            circle
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            {availableActions}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

HamkelasiActionsDropdown.propTypes = propTypes;
HamkelasiActionsDropdown.defaultProps = defaultProps;

export default withShortcutHelper(withModalMounter(HamkelasiActionsDropdown), 'openActions');
