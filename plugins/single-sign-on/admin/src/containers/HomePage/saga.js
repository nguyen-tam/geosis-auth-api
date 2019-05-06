// import { LOCATION_CHANGE } from 'react-router-redux';
// import { takeLatest, put, fork, take, cancel } from 'redux-saga/effects';
import { findIndex, get } from 'lodash';
import {
  takeLatest,
  put,
  fork,
  // take,
  // cancel,
  select,
  call,
} from 'redux-saga/effects';

import request from 'utils/request';

import {
    deleteDataSucceeded,
    fetchDataSucceeded,
    setForm,
    submitSucceeded,
} from './actions';

import {
    DELETE_DATA,
    FETCH_DATA,
    SUBMIT,
} from './constants';

import {
    makeSelectAllData,
    makeSelectDataToDelete,
    makeSelectDeleteEndPoint,
    makeSelectModifiedData,
} from './selectors';

export function* dataDelete() {
    try {
      const allData = yield select(makeSelectAllData());
      const dataToDelete = yield select(makeSelectDataToDelete());
      const endPointAPI = yield select(makeSelectDeleteEndPoint());
      const indexDataToDelete = findIndex(allData[endPointAPI], ['name', dataToDelete.name]);
  
      if (indexDataToDelete !== -1) {
        const id = dataToDelete.id;
        const requestURL = `/single-sign-on/${endPointAPI}/${id}`;
        const response = yield call(request, requestURL, { method: 'DELETE' });
  
        if (response.ok) {
          yield put(deleteDataSucceeded(indexDataToDelete));
          strapi.notification.success('Delete success!');
        }
      }
    } catch(err) {
      strapi.notification.error('Has an error!');
    }
  }

  export function* dataFetch(action) {
    try {
        const response = yield call(request, `/single-sign-on/${action.endPoint}`, { method: 'GET' });

        const data = response[action.endPoint] || response;
        yield put(fetchDataSucceeded(data));

    } catch(err) {
      strapi.notification.error('Have an error to fetch!');
    }
  }

  export function* submitData(action) {
    try {
      const body = yield select(makeSelectModifiedData());
      const opts = { method: 'PUT', body:  body };
  
      const response = yield call(request, `/single-sign-on/${action.endPoint}`, opts);
      
      if(response.ok){
        action.context.emitEvent('didEditOrigin'); //chú ý chỗ này
        yield put(submitSucceeded());
        strapi.notification.success('Submit success!');
      }
      // action.context.emitEvent('didEditOrigin');
      // yield put(submitSucceeded());
      // strapi.notification.success('Submit success!');
    } catch(error) {
      strapi.notification.error('Have an error to submit');
    }
  }

// Individual exports for testing
export function* defaultSaga() {
    yield fork(takeLatest, FETCH_DATA, dataFetch);

    yield fork(takeLatest, DELETE_DATA, dataDelete);
    yield fork(takeLatest, SUBMIT, submitData);
}

// All sagas to be loaded
export default defaultSaga; 