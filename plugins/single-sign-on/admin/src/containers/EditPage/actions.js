/*
 *
 * HomePage actions
 *
 */
import { fromJS } from 'immutable';
import { isArray } from 'lodash';
import { 
  ADD_ORIGIN,
  ON_CANCEL, 
  ON_CLICK_ADD,
  ON_CHANGE_INPUT,
  RESET_PROPS,
  SELECT_ALL_ACTIONS,
  SET_ACTION_TYPE,
  SET_ERRORS,
  SET_FORM,
  SUBMIT,
  SUBMIT_ERROR,
  SUBMIT_SUCCEEDED
} from './constants';

export function addOrigin(newOrigin) {
  return {
    type: ADD_ORIGIN,
    newOrigin,
  };
}

export function onCancel() {
  return {
    type: ON_CANCEL,
  };
}

export function onClickAdd(itemToAdd) {
  return {
    type: ON_CLICK_ADD,
    itemToAdd,
  };
}

export function onChangeInput({ target }) {
  const keys = ['modifiedData'].concat(target.name.split('.'));

  return {
    type: ON_CHANGE_INPUT,
    keys,
    value: target.value,
  };
}

export const resetProps = () => ({
  type: RESET_PROPS,
});

export function selectAllActions(name, shouldEnable) {
  return {
    type: SELECT_ALL_ACTIONS,
    keys: ['modifiedData'].concat(name.split('.')),
    shouldEnable,
  };
}

export function setActionType(action) {
  const actionType = action === 'create' ? 'POST' : 'PUT';

  return {
    type: SET_ACTION_TYPE,
    actionType,
  };
}

export function setErrors(formErrors) {
  return {
    type: SET_ERRORS,
    formErrors,
  };
}

export function setForm() {
  const form = Map({
    name: ''
  });

  return {
    type: SET_FORM,
    form,
  };
}

export function submit(context) {
  return {
    type: SUBMIT,
    context,
  };
}

export function submitError(errors) {
  return {
    type: SUBMIT_ERROR,
    errors,
  };
}

export function submitSucceeded() {
  return {
    type: SUBMIT_SUCCEEDED,
  };
}