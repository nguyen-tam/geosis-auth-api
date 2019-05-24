'use strict';

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require('lodash');
const request = require('request');

// Purest strategies.
const Purest = require('purest');

/**
 * Connect thanks to a third-party provider.
 *
 *
 * @param {String}    provider
 * @param {String}    access_token
 *
 * @return  {*}
 */

exports.connect = (provider, query) => {
  const access_token = query.access_token || query.code || query.oauth_token;

  return new Promise((resolve, reject) => {
    if (!access_token) {
      return reject(null, {
        message: 'No access_token.'
      });
    }
     
    // Get the profile.
    getProfile(provider, query, async (err, profile) => {
      if(err){                                              //=============them moi
        return reject([null, err]);
      } 

      try {
        const users = await strapi.query('user', 'users-permissions').find({
          email: profile.email
        });

        const advanced = await strapi.store({
            environment: '',
            type: 'plugin',
            name: 'users-permissions',
            key: 'advanced'
          }).get();

        const user = _.find(users, {provider});

        if (!_.isEmpty(user)) {
            return resolve([user, null]);
        }

        // Retrieve default role.
        const defaultRole = await strapi.query('role', 'users-permissions').findOne({ type: advanced.default_role }, []);

        // Create the new user.
        const params = _.assign(profile, {
          provider: provider,
          role: defaultRole._id || defaultRole.id
        });

        console.log(params);

        const createdUser = await strapi.query('user', 'users-permissions').create(params);

        return resolve([createdUser, null]);
      } catch (err) {
        reject([null, err]);
      }
    });
  });
};

/**
 * Helper to get profiles
 *
 * @param {String}   provider
 * @param {Function} callback
 */

const getProfile = async (provider, query, callback) => {
  const access_token = query.access_token || query.code || query.oauth_token;

  switch (provider) {
    case 'facebook': {
        const facebook = new Purest({
            provider: 'facebook'
        });

        facebook.query().get('me?fields=name,email').auth(access_token).request((err, res, body) => {
            console.log("================ 94 body: ", body)
            if (err) {
              console.log('====================== 95: facebook: ', err)
            callback(err);
            } else {
            callback(null, {
                username: body.name,
                email: body.email==undefined? body.id: body.email
            });
            }
        });
        break;
    }
    case 'google': {
      const google = new Purest({
        provider: 'google'
      });

      google.query('plus').get('people/me').auth(access_token).request((err, res, body) => {
        if (err) {
          console.log('108====================Service Providers GetProfile: ', err);
          callback(err);
        } else {
          callback(null, {
            username: body.emails[0].value.split("@")[0],
            email: body.emails[0].value
          });
        }
      });
      break;
    }
    default:
      callback({
        message: 'Unknown provider.'
      });
      break;
  }
};
