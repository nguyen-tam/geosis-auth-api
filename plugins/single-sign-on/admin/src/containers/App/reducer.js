/*
 *
 * App reducer
 *
 */

import { fromJS } from 'immutable';

const initialState = fromJS({
  isTest: false
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default appReducer;
