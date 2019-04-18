'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const crypto = require('crypto');
const _ = require('lodash');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  callback: async (ctx) => {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions'
    });

    if (provider === 'local') {
      if (!_.get(await store.get({key: 'grant'}), 'email.enabled') && !ctx.request.admin) {
        return ctx.badRequest(null, 'This provider is disabled.');
      }

      // The identifier is required.
      if (!params.identifier) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.email.provide' }] }] : 'Please provide your username or your e-mail.');
      }

      // The password is required.
      if (!params.password) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.provide' }] }] : 'Please provide your password.');
      }

      const query = {};

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi.query('user', 'users-permissions').findOne(query, ['role']);

      if (!user) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.invalid' }] }] : 'Identifier or password invalid.');
      }
      
      if (_.get(await store.get({key: 'advanced'}), 'email_confirmation') && user.confirmed !== true) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.confirmed' }] }] : 'Your account email is not confirmed.');
      }

      if (user.blocked === true) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.blocked' }] }] : 'Your account has been blocked by the administrator.');
      }

      if (user.role.type !== 'root' && ctx.request.admin) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.noAdminAccess' }] }] : `You're not an administrator.`);
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.local' }] }] : 'This user never set a local password, please login thanks to the provider used during account creation.');
      }

      const validPassword = strapi.plugins['users-permissions'].services.user.validatePassword(params.password, user.password);

      if (!validPassword) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.invalid' }] }] : 'Identifier or password invalid.');
      } else {
        // console.log(ctx);
        
        //=========================Single sign on===================================================================
        //service sso Post Login (trong file service users-permissions/services/sso.js)
        await strapi.plugins['users-permissions'].services.sso.ssoPostLogin(ctx, user);
        //=========================End Single Sign On===============================================================

        ctx.send({
          jwt: strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user.toJSON ? user.toJSON() : user, ['_id', 'id'])),
          user: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken'])
        });
      }
    } else {
      if (!_.get(await store.get({key: 'grant'}), [provider, 'enabled'])) {
        return ctx.badRequest(null, 'This provider is disabled.');
      }

      // Connect the user thanks to the third-party provider.
      let user, error;
      try {
        [user, error] = await strapi.plugins['users-permissions'].services.providers.connect(provider, ctx.query);
      } catch([user, error]) {
        return ctx.badRequest(null, (error === 'array') ? (ctx.request.admin ? error[0] : error[1]) : error);
      }

      if (!user) {
        return ctx.badRequest(null, (error === 'array') ? (ctx.request.admin ? error[0] : error[1]) : error);
      }

      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user, ['_id', 'id'])),
        user: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken'])
      });
    }
  },

  //======================Single Sign On===================================================
  logInSso: async (ctx, next) => {
    //su dung store de lay du lieu
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions'
    });

    // let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
    
    
    const EXPIRE_TIME_TOTAL = await strapi.plugins['users-permissions'].config.timeToExpire; //thoi gian ton tai 60s

    // console.log("Session User: ", ctx.session);

    var infoUser = null;
    //kiem tra neu expire time nho hon tg hien tai thi gan session user = null
    if (parseInt(new Date().getTime() / 1000) > ctx.session.expireTime) {
      ctx.state.session.user = null;
      infoUser = null;
    }

    //lay User info thong qua session
    const { token, user, exp} = ctx.session;
    if (parseInt(new Date().getTime() / 1000) < exp) {
      infoUser = user ? user : null;        //neu expire time cua user con thi gan infoUser= user
    }
    
    //lay du lieu tu store luu vao alloweOrigin 
    let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
    console.log("150 =========================== allowe Origin: ", alloweOrigin);

    //neu serviceURL = http://consumer.ankuranand.in:3020 != true thi thong bao loi
    const { serviceURL } = ctx.query;
    if (serviceURL != null) {
      let url = new URL(serviceURL);

      if (alloweOrigin[url.origin] !== true) {
        return ctx.redirect(`/auth/login?error=4`);
      }
    }

    if (infoUser != null && serviceURL != null) {
      ctx.state.session.expireTime = parseInt(new Date().getTime() / 1000) + EXPIRE_TIME_TOTAL;
      
      const url = new URL(serviceURL);
      await strapi.plugins['users-permissions'].services.sso.storeApplicationInCache(url.origin, infoUser.id, token);

      let urlService = url.origin + url.pathname + url.search + "?ssoToken=" + token;
      
      let client = await pluginStore.get({key: 'client'});
      if(client[url.origin] === 'geoset'){
        urlService = url.origin + url.pathname + url.search + "&ssoToken=" + token;
      }
      
      return ctx.redirect(urlService);
    }

    const { error } = ctx.query;
    const layoutPath = path.join(strapi.config.appPath, 'plugins', 'users-permissions', 'public', 'login.html');

    try {
      const layout = fs.readFileSync(layoutPath, 'utf8');
      const $ = cheerio.load(layout);

      // $('form').attr('action', '/auth/login');
      $('.error').text(_.isEmpty(error) ? '' : 'Wrong ...');

      if(error == 1){
        $('.error').text('Username is invalid');

      } else if (error == 2){
        $('.error').text('User is blocked');

      } else if (error == 3){
        $('.error').text('Username or Password is invalid');

      } else if(error == 4){
        $('.error').text('You are not allowed to access the sso-server');
      }

      try {
        fs.writeFileSync(layoutPath, $.html());

        ctx.url = path.basename(`${ctx.url}/login.html`);
        return await strapi.koaMiddlewares.static(`./plugins/users-permissions/public`)(ctx, next);

      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
    }
  },

  postLoginSso: async (ctx) => {
    const params = ctx.request.body;
    const query = {};

    if(ctx.request.query.serviceURL){
      var serviceURL = ctx.request.query.serviceURL;
    }

    // Check if the provided identifier is an email or not.
    const isEmail = emailRegExp.test(params.identifier);

    // Set the identifier to the appropriate query field.
    if (isEmail) {
      query.email = params.identifier.toLowerCase();
    } else {
      query.username = params.identifier;
    }

    // Check if the user exists.
    const user = await strapi.query('user', 'users-permissions').findOne(query, ['role']);
    //User ko ton tai
    if(!user){
      if(serviceURL){
        return ctx.redirect(`/auth/login?error=1&serviceURL=${serviceURL}`);
      }
      return ctx.redirect(`/auth/login?error=1`);
    }

    //User bi khoa
    if (user.blocked === true) {
      if(serviceURL){
        return ctx.redirect(`/auth/login?error=2&serviceURL=${serviceURL}`);
      }
      return ctx.redirect(`/auth/login?error=2`);
    }

    //so sanh password nhap vao voi password tren CSDL
    const validPassword = strapi.plugins['users-permissions'].services.user.validatePassword(params.password, user.password);

    //sai password
    if (!validPassword) {
      if(serviceURL){
        return ctx.redirect(`/auth/login?error=3&serviceURL=${serviceURL}`);
      }
      
      return ctx.redirect(`/auth/login?error=3`);
    } else { 
      //service sso Post Login (trong file service users-permissions/services/sso.js)
      const urllogin = await strapi.plugins['users-permissions'].services.sso.ssoPostLogin(ctx, user);
      
      return ctx.redirect(urllogin);
    }

    return ctx.redirect('/');
  },

  verifySsoToken: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions'
    });
    
    //lay thong tin user thong qua sso token 
    let infoUser = null;
    let userSso = null;
    const { ssoToken } = ctx.query;
    if(ssoToken != undefined || ssoToken != null ){
        userSso = await strapi.plugins['users-permissions'].services.jwt.verify(ssoToken);
    }

    //lay thong tin user bang ID
    if(userSso != null || userSso != undefined){
      infoUser = await strapi.query('user', 'users-permissions').findOne({id: userSso.id});
    }

    let intrmTokenCache = await pluginStore.get({key: 'intrmTokenCache'});
    const appName = intrmTokenCache[ssoToken] != undefined ? intrmTokenCache[ssoToken][1] : '';
    const globalSessionToken = intrmTokenCache[ssoToken] != undefined ? intrmTokenCache[ssoToken][0] : '';
    
    //neu user = null, ssoToken = null, intrmTokenCache chua ssoToken = null tra ve thong bao loi ko co quyen dang nhap
    if (
      infoUser == null || infoUser == undefined ||
      ssoToken == null || ssoToken == undefined ||
      intrmTokenCache[ssoToken] == null
    ) {
      return ctx.badRequest(null, 'Your are not allowed to access the sso-server');
    }

    //neu User == null hoac sessionApp ko chua user tra ve thong bao loi ko co quyen dang nhap
    let sessionApp = await pluginStore.get({key: 'sessionApp'}); 
    
    if (infoUser == null || infoUser == undefined || sessionApp[globalSessionToken][appName] !== true) {
      return ctx.response.forbidden('Unauthorized');
    }
    
    if(infoUser != null){
      //ma hoa user sang token
      infoUser = {...infoUser, globalSessionID: globalSessionToken};
      let payload =  await strapi.plugins['users-permissions'].services.sso.generatePayload(infoUser);
      const ISSUER = "simple-sso";
      const token_sso = await strapi.plugins['users-permissions'].services.jwt.issue(payload, {issuer: ISSUER, expiresIn: 10});
      
      //xoa intrmTokenCahce sau khi da ma hoa user sang token
      delete intrmTokenCache[ssoToken];
      let value = {...intrmTokenCache}; 
      await pluginStore.set({ key: 'intrmTokenCache', value});

      return ctx.send({token: token_sso});
    }
  },
  //=====================================End Single Sign On========================================================================

  changePassword: async (ctx) => {
    const params = _.assign({}, ctx.request.body, ctx.params);

    if (params.password && params.passwordConfirmation && params.password === params.passwordConfirmation && params.code) {
      const user = await strapi.query('user', 'users-permissions').findOne({ resetPasswordToken: params.code });

      if (!user) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.code.provide' }] }] : 'Incorrect code provided.');
      }

      // Delete the current code
      user.resetPasswordToken = null;

      user.password =  await strapi.plugins['users-permissions'].services.user.hashPassword(params);

      // Remove relations data to update user password.
      const data = _.omit(user, strapi.plugins['users-permissions'].models.user.associations.map(ast => ast.alias));

      // Update the user.
      await strapi.query('user', 'users-permissions').update(data);

      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user.toJSON ? user.toJSON() : user, ['_id', 'id'])),
        user: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken'])
      });
    } else if (params.password && params.passwordConfirmation && params.password !== params.passwordConfirmation) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.matching' }] }] : 'Passwords do not match.');
    } else {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.params.provide' }] }] : 'Incorrect params provided.');
    }
  },


  changeOwnPassword: async (ctx) => {

    console.log('da vao ham');
    
    const params = _.assign({}, ctx.request.body, ctx.params);

    if (params.password && params.passwordConfirmation && params.password === params.passwordConfirmation ) {

      

      const user = ctx.state.user;
      if (!user) {
        return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.code.provide' }] }] : 'Incorrect code provided.');
      }
       
      

      user.password =  await strapi.plugins['users-permissions'].services.user.hashPassword(params);

      // Remove relations data to update user password.
      const data = _.omit(user, strapi.plugins['users-permissions'].models.user.associations.map(ast => ast.alias));

      // Update the user.
      await strapi.query('user', 'users-permissions').update(data);

      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user.toJSON ? user.toJSON() : user, ['_id', 'id'])),
        user: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken'])
      });
    } else if (params.password && params.passwordConfirmation && params.password !== params.passwordConfirmation) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.matching' }] }] : 'Passwords do not match.');
    } else {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.params.provide' }] }] : 'Incorrect params provided.');
    }
  },

  connect: async (ctx, next) => {
    const grantConfig = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
      key: 'grant'
    }).get();

    const [ protocol, host ] = strapi.config.url.split('://');
    _.defaultsDeep(grantConfig, { server: { protocol, host } });

    const provider = process.platform === 'win32' ? ctx.request.url.split('\\')[2] : ctx.request.url.split('/')[2];
    const config = grantConfig[provider];

    if (!_.get(config, 'enabled')) {
      return ctx.badRequest(null, 'This provider is disabled.');
    }

    const Grant = require('grant-koa');
    const grant = new Grant(grantConfig);

    return strapi.koaMiddlewares.compose(grant.middleware)(ctx, next);
  },

  forgotPassword: async (ctx) => {
    const { email, url } = ctx.request.body;

    // Find the user user thanks to his email.
    const user = await strapi.query('user', 'users-permissions').findOne({ email });

    // User not found.
    if (!user) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.user.not-exist' }] }] : 'This email does not exist.');
    }

    // Generate random token.
    const resetPasswordToken = crypto.randomBytes(64).toString('hex');

    // Set the property code.
    user.resetPasswordToken = resetPasswordToken;

    const settings = (await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions'
    }).get({ key: 'email' }))['reset_password'].options;

    settings.message = await strapi.plugins['users-permissions'].services.userspermissions.template(settings.message, {
      URL: url,
      USER: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken', 'role', 'provider']),
      TOKEN: resetPasswordToken
    });

    settings.object = await strapi.plugins['users-permissions'].services.userspermissions.template(settings.object, {
      USER: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken', 'role', 'provider'])
    });
    
    try {
      // Send an email to the user.
      await strapi.plugins['email'].services.email.send({
        to: user.email,
        from: (settings.from.email || settings.from.name) ? `"${settings.from.name}" <${settings.from.email}>` : undefined,
        replyTo: settings.response_email,
        subject: settings.object,
        text: settings.message,
        html: settings.message
      });
    } catch (err) {
      return ctx.badRequest(null, err);
    }

    // Remove relations data to update user code.
    const data = _.omit(user, strapi.plugins['users-permissions'].models.user.associations.map(ast => ast.alias));

    // Update the user.
    await strapi.query('user', 'users-permissions').update(data);

    ctx.send({ ok: true });
  },

  register: async (ctx) => {
    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions'
    });

    const settings = await pluginStore.get({
      key: 'advanced'
    });

    if (!settings.allow_register) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.advanced.allow_register' }] }] : 'Register action is currently disabled.');
    }

    const params = _.assign(ctx.request.body, {
      provider: 'local'
    });

    // Password is required.
    if (!params.password) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.provide' }] }] : 'Please provide your password.');
    }

    // Throw an error if the password selected by the user
    // contains more than two times the symbol '$'.
    if (strapi.plugins['users-permissions'].services.user.isHashed(params.password)) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.password.format' }] }] : 'Your password cannot contain more than three times the symbol `$`.');
    }

    // Retrieve root role.
    const root = await strapi.query('role', 'users-permissions').findOne({ type: 'root' }, ['users']);
    const users = root.users || [];

    // First, check if the user is the first one to register as admin.
    const hasAdmin = users.length > 0;

    // Check if the user is the first to register
    const role = hasAdmin === false ? root : await strapi.query('role', 'users-permissions').findOne({ type: settings.default_role }, []);

    if (!role) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.role.notFound' }] }] : 'Impossible to find the root role.');
    }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    }

    params.role = role._id || role.id;
    params.password = await strapi.plugins['users-permissions'].services.user.hashPassword(params);

    const user = await strapi.query('user', 'users-permissions').findOne({
      email: params.email
    });

    if (user && user.provider === params.provider) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.email.taken' }] }] : 'Email is already taken.');
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      return ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: 'Auth.form.error.email.taken' }] }] : 'Email is already taken.');
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      const user = await strapi.query('user', 'users-permissions').create(params);

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user.toJSON ? user.toJSON() : user, ['_id', 'id']));

      if (settings.email_confirmation) {
        const storeEmail = (await pluginStore.get({
          key: 'email'
        })) || {};

        const settings = storeEmail['email_confirmation'] ? storeEmail['email_confirmation'].options : {};

        settings.message = await strapi.plugins['users-permissions'].services.userspermissions.template(settings.message, {
          URL: (new URL('/auth/email-confirmation', strapi.config.url)).toString(),
          USER: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken', 'role', 'provider']),
          CODE: jwt
        });

        settings.object = await strapi.plugins['users-permissions'].services.userspermissions.template(settings.object, {
          USER: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken', 'role', 'provider'])
        });

        try {
          // Send an email to the user.
          await strapi.plugins['email'].services.email.send({
            to: user.email,
            from: (settings.from.email && settings.from.name) ? `"${settings.from.name}" <${settings.from.email}>` : undefined,
            replyTo: settings.response_email,
            subject: settings.object,
            text: settings.message,
            html: settings.message
          });
        } catch (err) {
          return ctx.badRequest(null, err);
        }
      }

      if (!hasAdmin) {
        strapi.emit('didCreateFirstAdmin');
      }

      ctx.send({
        jwt,
        user: _.omit(user.toJSON ? user.toJSON() : user, ['password', 'resetPasswordToken'])
      });
    } catch(err) {
      const adminError = _.includes(err.message, 'username') ? 'Auth.form.error.username.taken' : 'Auth.form.error.email.taken';

      ctx.badRequest(null, ctx.request.admin ? [{ messages: [{ id: adminError }] }] : err.message);
    }
  },

  emailConfirmation: async (ctx) => {
    const params = ctx.query;

    const user = await strapi.plugins['users-permissions'].services.jwt.verify(params.confirmation);

    await strapi.plugins['users-permissions'].services.user.edit(_.pick(user, ['_id', 'id']), {confirmed: true});

    const settings = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
      key: 'advanced'
    }).get();

    ctx.redirect(settings.email_confirmation_redirection || '/');
  }
};
