import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { capitalize, get, includes } from 'lodash';
import { router } from 'app';

// Design
import IcoContainer from 'components/IcoContainer';
import PopUpWarning from 'components/PopUpWarning';

import en from 'translations/en.json';
import styles from './styles.scss';

class ListRow extends React.Component {
    state = { showModalDelete: false };

    generateContent = () => {
        let icons = [
            {
              icoType: 'pencil',
              onClick: this.handleClick,
            },
            {
              icoType: 'trash',
              onClick: () => { this.setState({ showModalDelete: true }); },
            },
          ];

        switch(this.props.settingType){
            case 'origin': 
                const name = this.props.item.name.replace(/\-/gi, ".");
                return (
                    <div className={cn('row', styles.wrapper)} style={{ paddingLeft: '20px'}}>
                        <div className="col-md-6">
                            <b>{name}</b>
                        </div>
                        <div className="col-md-4">
                            {/* {this.props.item.allow ? " Enable" : "Disable"}  */} 
                            <b>{this.props.item.allow ? (
                                <span style={{ color: '#5A9E06' }}>Enabled</span>
                            ) : (
                                <span style={{ color: '#F64D0A' }}>Disabled</span>
                            )}</b>
                        </div>
                
                        <div className="col-md-2">
                            <IcoContainer icons={icons} />
                        </div>
                    </div>
                );
            case 'app-name':
                icons.pop();
                
                return(
                    <div className={cn('row', styles.wrapper)} style={{ paddingLeft: '20px'}}>
                        <div className="col-md-6">
                            <b>{this.props.item.origin}</b>
                        </div>
                        <div className="col-md-4">
                            {/* {this.props.item.allow ? " Enable" : "Disable"}  */} 
                            <b>{this.props.item.appName }</b>
                        </div>
                
                        <div className="col-md-2">
                            <IcoContainer icons={icons} />
                        </div>
                    </div>
                );
            case 'client':
                const nameClient = this.props.item.name.replace(/\-/gi, ".");
                icons.pop();
                return(
                    <div className={cn('row', styles.wrapper)} style={{ paddingLeft: '20px'}}>
                        <div className="col-md-6">
                            <b>{nameClient}</b>
                        </div>
                        <div className="col-md-4">
                            {/* {this.props.item.allow ? " Enable" : "Disable"}  */} 
                            <b>{this.props.item.allow ? (
                                <span style={{ color: '#5A9E06' }}>Enabled</span>
                            ) : (
                                <span style={{ color: '#F64D0A' }}>Disabled</span>
                            )}</b>
                        </div>
                
                        <div className="col-md-2">
                            <IcoContainer icons={icons} />
                        </div>
                    </div>
                );
            default: 
                return '';
        }
    }

    handleClick = () => {
        switch (this.props.settingType) {
          case 'origin': {
            //   return router.push(`${router.location.pathname}/edit/${this.props.item.name}`); 
            this.context.emitEvent('willEditSingleSignOnOrigin');
        
            return this.context.setDataToEdit(this.props.item.name);
          }
          case 'client': {
            //   return router.push(`${router.location.pathname}/edit/${this.props.item.name}`); 
            this.context.emitEvent('willEditSingleSignOnClient');
        
            return this.context.setDataToEdit(this.props.item.name);
          }
          default:
            return;
        }
    }

    handleDelete = () => {
        this.props.deleteData(this.props.item, this.props.settingType);
        this.setState({ showModalDelete: false });
    }

    render() {
        return (
          <li className={styles.li} onClick={this.handleClick}>
            <div className={styles.container}>
              {this.generateContent()}
            </div>
            <PopUpWarning
                isOpen={this.state.showModalDelete}
                onConfirm={this.handleDelete}
                toggleModal={() => this.setState({ showModalDelete: false })}
            />
          </li>
        );
      }
}

ListRow.contextTypes = {
    emitEvent: PropTypes.func,
    setDataToEdit: PropTypes.func.isRequired,
};

ListRow.defaultProps = {
    settingType: 'origin',
}; 

ListRow.propTypes = {
    deleteData: PropTypes.func.isRequired,
    item: PropTypes.object,
    settingType: PropTypes.string,
    values: PropTypes.object.isRequired,
};

export default ListRow;