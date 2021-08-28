import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { styles } from './styles';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  hamkelasiParams: PropTypes.object.isRequired,
};

const defaultProps = {
  compact: false,
};

const intlMessages = defineMessages({
  classInfoTitle: {
    id: 'app.userList.classInfoTitle',
    description: 'Title for the class info',
  },
});

class ClassInfo extends PureComponent {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const {
      intl,
      compact,
	  hamkelasiParams,
    } = this.props;

	var classInfo = [];
	var i = 1;
	for(var obj of hamkelasiParams.classinfo)
	{
		classInfo.push(
			<div className={styles.listItem} key={'class-info-item-'+i++}>
				<span className={styles.listItemIcon}>{obj.icon ? <i className={'icon-bbb-'+obj.icon}></i> : null}</span>
				<span className={styles.listItemKey}>{obj.key+':'}</span>
				<span className={styles.listItemValue}>{obj.value}</span>
			</div>
		);
	}

    return (
	  <div className={styles.classInfo}>
		<div className={styles.container}>
		  {
			!compact ? (
			  <h2 className={styles.smallTitle}>
				{intl.formatMessage(intlMessages.classInfoTitle)}
			  </h2>
			) : (
			  <hr className={styles.separator} />
			)
		  }
		</div>
		<div
		  role="tabpanel"
		  tabIndex={0}
		  className={styles.scrollableList}
		  ref={(ref) => { this._msgsList = ref; }}
		>
		  <div className={styles.list}>
			  {classInfo}
		  </div>
		</div>
	  </div>
    );
  }
}

ClassInfo.propTypes = propTypes;
ClassInfo.defaultProps = defaultProps;

export default ClassInfo;