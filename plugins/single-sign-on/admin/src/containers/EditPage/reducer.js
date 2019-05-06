import { fromJS, List, Map } from 'immutable';
import { map } from 'lodash';

import {
    ADD_ORIGIN,
    ON_CANCEL,
    ON_CHANGE_INPUT,
    ON_CLICK_ADD,
    RESET_PROPS,
    SELECT_ALL_ACTIONS,
    SET_ACTION_TYPE,
    SET_ERRORS,
    SET_FORM,
    SUBMIT_ERROR,
    SUBMIT_SUCCEEDED,
  } from './constants';

  const initialState = fromJS({
    actionType: 'POST',
    didCheckErrors: false,
    didSubmit: false,
    formErrors: List([]),
    initialData: Map({}),
    modifiedData: Map({}),
    routes: Map([]),
    origins: List([]),
  });

  function editPageReducer(state = initialState, action) {
    switch (action.type) {
    
    case ADD_ORIGIN:
        return state
            .updateIn(['modifiedData', 'origins'], list => list.push(action.newOrigin));
    case ON_CANCEL:
        return state
            .set('didCheckErrors', !state.get('didCheckErrors'))
            .set('formErrors', List([]))
            .set('modifiedData', state.get('initialData'));
    case ON_CHANGE_INPUT:
        return state
            .updateIn(action.keys, () => action.value);
    case ON_CLICK_ADD:
        return state
            .updateIn(['modifiedData', 'origins'], list => list.push(action.itemToAdd));
    case RESET_PROPS:
        return state
            .updateIn(['modifiedData'], () => Map({}))
            .update('initialData', () => Map({}))
            .update('origins', () => List([]));
    case SET_ACTION_TYPE:
        return state
            .set('formErrors', List([]))
            .set('actionType', action.actionType);
    case SET_ERRORS:
        return state
            .set('formErrors', List(action.formErrors))
            .set('didCheckErrors', !state.get('didCheckErrors'));
    case SET_FORM:
        return state
            .set('initialData', action.form)
            .set('modifiedData', action.form);
    case SUBMIT_ERROR:
        return state
            .set('formErrors', List(action.errors));
    case SUBMIT_SUCCEEDED:
        return state
            .set('didSubmit', !state.get('didSubmit'));
    default:
        return state;
    }
  }

  export default editPageReducer;