import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
//import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const messages = defineMessages({
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
});

const propTypes = {
	user: PropTypes.shape({}),
	intl: PropTypes.shape({
		formatMessage: PropTypes.func.isRequired,
	}).isRequired,
	mid: PropTypes.number.isRequired,
	sid: PropTypes.string.isRequired,
	host: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
};

class HamkelasiModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
	
	window.addEventListener("message", function(event) {
	  if(event.data == "closeModal")
	  {
		  props.mountModal(null);
	  }
	});
  }

  render() {
    const {
      mountModal, onConfirm, user, title, intl, mid, sid, host, url, action,
    } = this.props;

    const {
      checked,
    } = this.state;
	
    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={() => mountModal(null)}
        hideBorder
        contentLabel={title}
		style={{width: '100%', height: '100vh'}}
      >
	  
		<div className={styles.content}>
		  <iframe id="hamkelasi_modal" src={url+'?meetingId='+mid+'&hfw_SID='+sid+'&host='+host+(user?'&username='+user.extId:'')+'&action='+action}
			frameBorder="0" border="0" cellSpacing="0" className="gradesInternalFrame" style={{width: '100%', height: 'calc(100vh - 56px)'}}></iframe> 
		</div>
			
      </Modal>
    );
  }
}

HamkelasiModal.propTypes = propTypes;
export default withModalMounter(HamkelasiModal);
