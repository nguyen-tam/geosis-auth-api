import { LOCATION_CHANGE } from 'react-router-redux';
import {
  all,
  call,
  cancel,
  fork,
  put,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects';
import request from 'utils/request';
import {
  submitSucceeded,
} from './actions';

import {
  SUBMIT,
} from './constants';

import {
  makeSelectActionType,
  makeSelectModifiedData,
} from './selectors';


export function* submit(action) {
  try {
    const actionType = yield select(makeSelectActionType());
    const body = yield select(makeSelectModifiedData());
    const opts = {
      method: actionType,
      body,
    };

    const requestURL = actionType === 'POST' ? '/single-sign-on/origin' : actionType;
    const response = yield call(request, requestURL, opts);
    
    if (actionType === 'POST') {
      action.context.emitEvent('didCreateOrigin');
    }
    
    if (response.ok) {
      console.log("successful!");
      yield put(submitSucceeded());
    }
  } catch(error) {
    console.log(error); // eslint-disable-line no-console
  }
}

export default function* defaultSaga() {
  yield fork(takeLatest, SUBMIT, submit);

  yield take(LOCATION_CHANGE);
}
