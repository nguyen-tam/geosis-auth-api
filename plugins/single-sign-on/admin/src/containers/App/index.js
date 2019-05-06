/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Switch, Route } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';

// Utils
import pluginId from 'pluginId';

// Containers
import HomePage from 'containers/HomePage';
import EditPage from 'containers/EditPage';
import NotFoundPage from 'containers/NotFoundPage';
// When you're done studying the ExamplePage container, remove the following line and delete the ExamplePage container
import ExamplePage from 'containers/ExamplePage';

import reducer from './reducer';

class App extends React.Component {
  // When you're done studying the ExamplePage container, remove the following lines and delete the ExamplePage container
  componentDidMount() {
    if (!this.props.location.pathname.split('/')[3]) {
      this.props.history.push('/plugins/single-sign-on/origin');
    }
  }
  
  componentDidUpdate() {
    if (!this.props.location.pathname.split('/')[3]) {
      this.props.history.push('/plugins/single-sign-on/origin');
    }
  }

  render() {
    return (
      <div className={pluginId}>
        <Switch>
          <Route path={`/plugins/${pluginId}/:settingType/:actionType/:id?`} component={EditPage} exact />
          <Route path={`/plugins/${pluginId}/:settingType`} component={HomePage} exact />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

App.contextTypes = {
  plugins: PropTypes.object,
  router: PropTypes.object.isRequired,
  updatePlugin: PropTypes.func,
};

App.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {},
    dispatch,
  );
}

const mapStateToProps = createStructuredSelector({});

// Wrap the component to inject dispatch and state into it
const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = strapi.injectReducer({ key: 'global', reducer, pluginId });

export default compose(
  withReducer,
  withConnect,
)(App);
