import { get, isEmpty, isObject } from 'lodash';

export default function checkFormValidity(settingType, data, providerToEdit = '') {
  const formErrors = [];

  switch (settingType) {
    case 'app-name': {
      const isProviderEnabled = get(data, 'origin');
      const keys =['origin', 'appName'];

      keys.forEach(key => {
        if (isProviderEnabled && isEmpty(get(data, key))) {
          formErrors.push({ name: key, errors: [{ id: 'components.Input.error.validation.required' }] });
        }
      });
      break;
    }
    case 'client': {
      const client = get(data, 'origin');
      const keys =['origin', 'name'];

      keys.forEach(key => {
        if (client && isEmpty(get(data, key))) {
          formErrors.push({ name: key, errors: [{ id: 'components.Input.error.validation.required' }] });
        }
      });
      break;
    }
    default:

  }

  return formErrors;
}
