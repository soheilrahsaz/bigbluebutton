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
  hamkelasiInfoTitle: {
    id: 'app.userList.hamkelasiInfoTitle',
    description: 'Title for the hamkelasi info',
  },
});

class HamkelasiInfo extends PureComponent {
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

	var hamkelasiInfo = [];
	var i = 1;
	if(Meteor.settings.public.hamkelasi)
	{
		for(var obj of hamkelasiParams.hamkelasiinfo)
		{
			if(obj.value && obj.value !='undefined')
			{
				let link = null;
				if(obj.value == 'onlineclass')
				{
					link = Meteor.settings.public.hamkelasi.onlineClassUrl;
				}else if(obj.value == 'requirement')
				{
					link = Meteor.settings.public.hamkelasi.requirementUrl;
				}else if(obj.value == 'errors')
				{
					link = Meteor.settings.public.hamkelasi.errorUrl.topClass;
				}
				
				if(link)
				{
						hamkelasiInfo.push(
					<div className={styles.listItem} key={'hamkelasi-info-item-'+i++}>
						<span className={styles.listItemIcon}>{obj.icon ? <i className={'icon-bbb-'+obj.icon}></i> : null}</span>
						<a target="_blank" className={styles.listItemKeyHamkelasi} href={link}>{obj.key}</a>
					</div>
					);
				}
			}
		}	
	}
	

    return (
	  <div className={styles.hamkelasiInfo}>
		<div className={styles.container}>
		  {
			!compact ? (
			  <h2 className={styles.smallTitle}>
				{intl.formatMessage(intlMessages.hamkelasiInfoTitle)}
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
			  {hamkelasiInfo}
		  </div>
		</div>
	  </div>
    );
  }
}

HamkelasiInfo.propTypes = propTypes;
HamkelasiInfo.defaultProps = defaultProps;

export default HamkelasiInfo;