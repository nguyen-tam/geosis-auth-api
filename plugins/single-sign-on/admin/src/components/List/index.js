/**
*
* List
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { map, omitBy, size } from 'lodash';
import cn from 'classnames';

// Components from strapi-helper-plugin
import LoadingBar from 'components/LoadingBar';
import LoadingIndicator from 'components/LoadingIndicator';

// Design
import Button from 'components/Button';
import ListRow from '../ListRow';

import styles from './styles.scss';

const generateListTitle = (data, settingType) => { 
  return '';
};

function List({ data, deleteData, noButton, onButtonClick, settingType, showLoaders, values }) {
    if(settingType === 'origin'){
      noButton = false;
    } else {
      noButton = true;
    }

    return (
        <div className={styles.list}>
          <div className={styles.flex}>
            <div className={styles.titleContainer}>
              {showLoaders ? <LoadingBar style={{ marginTop: '0' }} /> : generateListTitle(data, settingType)}
            </div>
            <div className={styles.buttonContainer}>
              {noButton ? (
                ''
              ) : (
                <Button onClick={onButtonClick} secondaryHotlineAdd>
                  <FormattedMessage id={`Add new ${settingType}`} />
                </Button>
              )}
            </div>
          </div>
          <div className={cn(styles.ulContainer, showLoaders && styles.loadingContainer, showLoaders && settingType === 'origin' && styles.loadingContainerRole )}>
            {showLoaders ? <LoadingIndicator /> : (
              <ul className={noButton ? styles.listPadded : ''}>
                {map(data, item => (
                  <ListRow
                    deleteData={deleteData}
                    item={item}
                    key={item.name}
                    settingType={settingType}
                    values={values}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      );
}

List.defaultProps = {
  noButton: false,
  onButtonClick: () => {},
  showLoaders: true,
};

List.propTypes = {
  data: PropTypes.array.isRequired,
  deleteData: PropTypes.func.isRequired,
  noButton: PropTypes.bool,
  onButtonClick: PropTypes.func,
  settingType: PropTypes.string.isRequired,
  showLoaders: PropTypes.bool,
  values: PropTypes.object.isRequired,
};

export default List;