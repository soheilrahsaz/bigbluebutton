import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  rebuildMeetingTitle: {
    id: 'app.rebuildMeeting.title',
    description: 'rebuild meeting title',
  },
  rebuildMeetingDescription: {
    id: 'app.rebuildMeeting.description',
    description: 'rebuild meeting description',
  },
  yesLabel: {
    id: 'app.rebuildMeeting.yesLabel',
    description: 'label for yes button for rebuild meeting',
  },
  noLabel: {
    id: 'app.rebuildMeeting.noLabel',
    description: 'label for no button for rebuild meeting',
  },
});

const { warnAboutUnsavedContentOnMeetingEnd } = Meteor.settings.public.app;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  rebuildMeeting: PropTypes.func.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  users: PropTypes.number.isRequired,
};

class RebuildMeetingComponent extends PureComponent {
  render() {
    const {
      users, intl, closeModal, rebuildMeeting, meetingTitle,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        title={intl.formatMessage(intlMessages.rebuildMeetingTitle, { 0: meetingTitle })}
      >
        <div className={styles.container}>
          <div className={styles.description}>
            {
				intl.formatMessage(intlMessages.rebuildMeetingDescription)
            }
			<ul>
				<li>مشکل در کارایی تخته کلاس</li>
				<li>قطع شدن صدای همه کاربران</li>
				<li>عدم ایجاد اتاق های زیرمجموعه</li>
			</ul>
			
			<span>آیا همچنان به بازسازی کلاس تمایل دارید؟</span>
          </div>
          <div className={styles.footer}>
            <Button
              data-test="confirmEndMeeting"
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={rebuildMeeting}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={closeModal}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

RebuildMeetingComponent.propTypes = propTypes;

export default injectIntl(RebuildMeetingComponent);
