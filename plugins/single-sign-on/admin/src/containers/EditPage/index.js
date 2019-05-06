/**
 * 
 * EditPage
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import { findIndex, get, isEmpty, isEqual, size } from 'lodash';
import pluginId from 'pluginId';
import cn from 'classnames';

// Design
import BackHeader from 'components/BackHeader';
import Input from 'components/InputsIndex';
import LoadingIndicator from 'components/LoadingIndicator';
import LoadingIndicatorPage from 'components/LoadingIndicatorPage';
import PluginHeader from 'components/PluginHeader';

import {
    addOrigin,
    onCancel,
    onClickAdd,
    onChangeInput,
    selectAllActions,
    setActionType,
    setErrors,
    setForm,
    submit,
    resetProps,
  } from './actions';

// Selectors
import makeSelectEditPage from './selectors';

import reducer from './reducer';
import saga from './saga';

import styles from './styles.scss';

export class EditPage extends React.Component {
    state = {enabled: false}

    getChildContext = () => ({
        onChange: this.props.onChangeInput,
        selectAllActions: this.props.selectAllActions,
    });

    // componentDidMount() {
    //     this.props.setActionType(this.props.match.params.actionType);
    //     if (this.props.match.params.actionType === 'create') {
    //         // Set reducer modifiedData
    //         this.props.setForm();
    //       }
    // }

    componentWillReceiveProps(nextProps) {
        // Redirect user to HomePage if submit ok
        if (nextProps.editPage.didSubmit !== this.props.editPage.didSubmit) {
          this.props.history.push('/plugins/single-sign-on/origin');
        }
    }

    componentWillUnmount() {
        // Empty formErrors
        this.props.setErrors([]);
        // Empty modifiedData so prev values aren't displayed when loading
        this.props.resetProps();
    } 

    handleSubmit = () => {
        // Check if the name field is filled
        if (isEmpty(get(this.props.editPage, ['modifiedData', 'name']))) {
          return this.props.setErrors([{ name: 'name', errors: [{ id: 'single-sign-on.EditPage.form.origin.name.error' }] }]);
        }
    
        this.props.submit(this.context);
    }

    showLoaderForm = () => {
        const { editPage: { modifiedData }, match: { params: { actionType } } } = this.props;

        return actionType !== 'create' && isEmpty(modifiedData);
    }

    cancelClick = (e) => {
        this.setState({ enabled: false });
        this.props.onCancel();
    }
 
    handleChange = (e) => {
        this.setState({ enabled: e.target.value });
        this.props.onChangeInput(e);
    }

    textChange = (e) => {
        this.props.onChangeInput(e);
    }
 
    renderFirstBlock = () => (
        <React.Fragment>
            <div className="col-md-6">
                <div className="row">
                <Input
                    autoFocus
                    customBootstrapClass="col-md-12"
                    errors={get(this.props.editPage, ['formErrors', findIndex(this.props.editPage.formErrors, ['name', 'name']), 'errors'])}
                    didCheckErrors={this.props.editPage.didCheckErrors}
                    label={{ id: 'single-sign-on.EditPage.form.label.url' }}
                    name="name"
                    onChange={this.textChange}
                    type="text"
                    validations={{ required: true }}
                    value={get(this.props.editPage, ['modifiedData', 'name'])} 
                />
                </div>
            </div>

            <div className="col-md-6">
                <div className="row">
                <Input
                    inputDescription={{ id: 'single-sign-on.EditPage.form.description.toggle'  }} //sua o day
                    label={{ id: 'single-sign-on.EditPage.form.label.toggle' }}
                    name={`allow`}
                    onChange={this.handleChange}
                    type="toggle"
                    validations={{}}
                    value={this.state.enabled}
                />
                </div>
            </div>
        </React.Fragment>
    )

    render() {
        const pluginHeaderTitle = this.props.match.params.actionType === 'create' ?
            'single-sign-on.EditPage.header.title.create'
            : '';
        
        const pluginHeaderDescription = this.props.match.params.actionType === 'create' ?
            'single-sign-on.EditPage.header.description.create'
            : '';
        
        const pluginHeaderActions = [
            {
                label: 'Cancel',
                kind: 'secondary',
                // onClick: this.props.onCancel,
                onClick: this.cancelClick,
                type: 'button',
            },
            {
                kind: 'primary',
                label: 'Submit',
                onClick: this.handleSubmit,
                type: 'submit',
                disabled: isEqual(this.props.editPage.modifiedData, this.props.editPage.initialData),
            },
        ];    

        if (this.showLoaderForm()) {
            return <LoadingIndicatorPage />;
        }

        return (
            <div>
                <BackHeader onClick={() => this.props.history.goBack()} />
                <div className={cn('container-fluid', styles.containerFluid)}>
                    <PluginHeader 
                        title={{
                            id: pluginHeaderTitle,
                            values: {
                                name: get(this.props.editPage.initialData, 'name')
                            }
                        }}

                        description={{
                            id: pluginHeaderDescription,
                            values: {
                            description: get(this.props.editPage.initialData, 'description') || '',
                            },
                        }}
                        actions={pluginHeaderActions}
                    />

                    <div className={cn('row', styles.container)}>
                        <div className="col-md-12">
                            <div className={styles.main_wrapper}>
                                <div className={styles.titleContainer}>
                                    <FormattedMessage id="single-sign-on.EditPage.form.origin" />
                                </div>

                                <form className={styles.form}>
                                    <div className="row">    
                                        {this.showLoaderForm() ? (
                                            <div className={styles.loaderWrapper}><LoadingIndicator /></div>
                                        ) : this.renderFirstBlock()}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

EditPage.childContextTypes = {
    onChange: PropTypes.func.isRequired,
    selectAllActions: PropTypes.func.isRequired,
};

EditPage.contextTypes = {
    emitEvent: PropTypes.func,
};

EditPage.propTypes = {
    editPage: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChangeInput: PropTypes.func.isRequired,
    onClickAdd: PropTypes.func.isRequired,
    resetProps: PropTypes.func.isRequired,
    selectAllActions: PropTypes.func.isRequired,
    setActionType: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    setForm: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
    editPage: makeSelectEditPage(),
});

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addOrigin,
            onCancel,
            onClickAdd,
            onChangeInput,
            selectAllActions,
            setActionType,
            setErrors,
            setForm,
            submit,
            resetProps,
        },
        dispatch,
    );
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = strapi.injectReducer({ key: 'editPage', reducer, pluginId });
const withSaga = strapi.injectSaga({ key: 'editPage', saga, pluginId });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(EditPage);