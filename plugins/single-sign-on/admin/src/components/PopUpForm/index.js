/**
*
* PopUpForm
*
*/

import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  capitalize,
  get,
  findIndex,
  isArray,
  isEmpty,
  isObject,
  includes,
  map,
  startsWith,
  tail,
  take,
  takeRight,
} from 'lodash';

// Translations
import en from 'translations/en.json';

import Input from 'components/InputsIndex';

import styles from './styles.scss';

class PopUpForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  state = { enabled: true, isEditing: true };

  componentWillReceiveProps(nextProps) {
    const { values } = nextProps;

    if (get(values, 'allow') && get(values, 'allow') !== get(this.props.values, 'allow')) {
      this.setState({ enabled: get(values, 'allow') });
    }
  }

  handleChange = (e) => {
    this.setState({ enabled: e.target.value });
    this.props.onChange(e);
  }

  handleFocus = () => this.setState({ isEditing: true }); 

  renderForm = () => {
    const { dataToEdit, settingType, values }  = this.props;
    
    if (settingType === 'origin') {
      return (
        <div className={`row ${styles.providerDisabled}`}>
          <Input
            inputDescription={{ id: 'single-sign-on.PopUpForm.Origin.enabled.description'  }} //sua o day
            label={{ id: 'single-sign-on.PopUpForm.Origin.enabled.lable' }}
            name={`${settingType}.${dataToEdit}.allow`}
            onChange={this.handleChange}
            type="toggle"
            validations={{}}
            value={get(this.props.values, 'allow', this.state.enabled)}
          />
        </div>
      );
    } else if (settingType === 'client'){
      return (
        <div className={`row ${styles.providerDisabled}`}>
          <Input
            inputDescription={{ id: 'single-sign-on.PopUpForm.Origin.enabled.description'  }}
            label={{ id: 'single-sign-on.PopUpForm.Origin.enabled.lable' }}
            name={`${settingType}.${dataToEdit}.allow`}
            onChange={this.handleChange}
            type="toggle"
            validations={{}}
            value={get(this.props.values, 'allow', this.state.enabled)}
          />
        </div>
      );
    }
  }

  render() {
    const { display } = this.props.values;
    const { actionType, dataToEdit, settingType } = this.props;

    let changeDataToEdit = dataToEdit.replace(/\-/gi, "."); //sua lai ten
    let header = <span>{changeDataToEdit}</span>;

    if (actionType) {
      if(settingType === 'origin') {
        header = <FormattedMessage id={`single-sign-on.PopUpForm.header.${actionType}.${settingType}`} values={{ origin: <i>{capitalize(changeDataToEdit)}</i> }} />;
      } else {
        header = <FormattedMessage id={`single-sign-on.PopUpForm.header.${actionType}.${settingType}`} values={{ client: <i>{capitalize(changeDataToEdit)}</i> }} />;
      }
    }

    if (display && en[display]) {
      header = <FormattedMessage id={`${display}`} />;
    }

    return (
      <div className={styles.popUpForm}>
        <Modal isOpen={this.props.isOpen} toggle={this.context.unsetDataToEdit} className={`${styles.modalPosition}`}>
          <ModalHeader toggle={this.context.unsetDataToEdit} className={styles.modalHeader} />
          <div className={styles.headerContainer}>
            <div>
              {header}
            </div>
          </div>
          <form onSubmit={this.props.onSubmit}>
            <ModalBody className={styles.modalBody}>
              <div className="container-fluid">
                {this.renderForm()}
              </div>
            </ModalBody>
            <ModalFooter className={styles.modalFooter}>
              <Button onClick={() => this.context.unsetDataToEdit()} className={styles.secondary}>
                <FormattedMessage id="Cancel" />
              </Button>
              <Button type="submit" onClick={this.props.onSubmit} className={styles.primary}>
                <FormattedMessage id="Save" />
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    );
  }
}

PopUpForm.contextTypes = {
  unsetDataToEdit: PropTypes.func.isRequired,
};

PopUpForm.defaultProps = {
  settingType: 'origin',
  // showLoader: false,
};

PopUpForm.propTypes = {
  actionType: PropTypes.string.isRequired,
  dataToEdit: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  didCheckErrors: PropTypes.bool.isRequired,
  formErrors: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  settingType: PropTypes.string,
  // showLoader: PropTypes.bool,
  values: PropTypes.object.isRequired,
};

export default PopUpForm;
