'use strict';

const _ = require('lodash');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {

  index: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
    let originAllow = _.map(alloweOrigin, function(value, key){
      return {name: key, allow: value}
    });

    ctx.send({ originAllow });
  },

  origin: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});

    let i =  0;
    let originAllow = _.mapValues(alloweOrigin, function(value){
      i++
      return {allow: value, id: i}
    });

    let originMapKeys = _.mapKeys(originAllow, function(value, key){
      return key.replace(/\./gi, "-");
    });
    
    ctx.send(originMapKeys);
  },

  createOrigin: async (ctx) =>{
    try {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'single-sign-on'
      });
  
      let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
      let originAppName = await pluginStore.get({key: 'originAppName'});
      let client = await pluginStore.get({key: 'client'});
      let allow = false;
      let allowClient = false;
      let appName = 'sso_consumer';
      let name = ctx.request.body.name;
      
      if(ctx.request.body.allow !== undefined){
        allow = ctx.request.body.allow;
      }
      
      //Insert allow Origin vao store
      let alloweOriginValue = {}
      alloweOriginValue[name] = allow;
      alloweOrigin = _.assign(alloweOrigin, alloweOriginValue);
      await pluginStore.set({ key: 'alloweOrigin', value: alloweOrigin});
      console.log("73=====================: ");
      console.log(alloweOrigin);

      //Insert originAppName vao store
      let originAppNameValue = {}
      originAppNameValue[name] = appName;
      originAppName = _.assign(originAppName, originAppNameValue);
      await pluginStore.set({ key: 'originAppName', value: originAppName});
      console.log("80=====================: ");
      console.log(originAppName);

      //Insert Client vao store
      let clientValue = {}
      clientValue[name] = allowClient;
      client = _.assign(client, clientValue);
      await pluginStore.set({ key: 'client', value: client});
      console.log("87=====================: ");
      console.log(client);
      
      ctx.send({ok: 200});
    } catch(err){
      console.log(err);
    }
    
  },

  updateOrigin: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });
    
    let originMapKeys = _.mapKeys(ctx.request.body.origin, function(value, key){
      return key.replace(/\-/gi, ".");
    });

    let originMapValues = _.mapValues(originMapKeys, function(value){
      return value.allow;
    }); 

    await pluginStore.set({ key: 'alloweOrigin', value: originMapValues});

    console.log("76==============origin map value: ");
    console.log(originMapValues);

    ctx.send({ok: 200});
  },

  deleteOrigin: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
    let originAppName = await pluginStore.get({key: 'originAppName'});
    let client = await pluginStore.get({key: 'client'});

    let i =  0;
    let originAllow = _.mapValues(alloweOrigin, function(value){
      i++
      return {allow: value, id: i}
    });

    let origin = _.findKey(originAllow, function(x){
      return x.id == ctx.params.id;
    });
    
    if(alloweOrigin[origin] !== undefined && originAppName[origin] !== undefined && client[origin] !== undefined){
      delete alloweOrigin[origin];
      alloweOrigin = {...alloweOrigin}; 
      await pluginStore.set({ key: 'alloweOrigin', value: alloweOrigin});

      delete originAppName[origin];
      originAppName = {...originAppName}; 
      await pluginStore.set({ key: 'originAppName', value: originAppName});

      delete client[origin];
      client = {...client}; 
      await pluginStore.set({ key: 'client', value: client});

      ctx.send({ok: 200});
    }
  },

  appName: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    let originAppName = await pluginStore.get({key: 'originAppName'});

    let appNameOrigin = _.map(originAppName, function(value, key){
      return {origin: key, appName: value}
    });

    var arrAppNameOrigin = [];
    for (let i = 0; i < appNameOrigin.length; i++) { 
      arrAppNameOrigin.push({origin: appNameOrigin[i].origin, appName: appNameOrigin[i].appName, id: i+1});
    }

    ctx.send(arrAppNameOrigin);
  },

  client: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    let client = await pluginStore.get({key: 'client'});
    console.log("147======================: ", client);

    let i =  0;
    let clientAllow = _.mapValues(client, function(value){
      i++
      return {allow: value, id: i}
    });

    let clientMapKeys = _.mapKeys(clientAllow, function(value, key){
      return key.replace(/\./gi, "-");
    });
    
    console.log("159======================: ", clientMapKeys);
    
    ctx.send(clientMapKeys);
  },

  updateClient: async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });
    
    let clientMapKeys = _.mapKeys(ctx.request.body.client, function(value, key){
      return key.replace(/\-/gi, ".");
    });
    
    let clientMapValues = _.mapValues(clientMapKeys, function(value){
      return value.allow;
    });
    await pluginStore.set({ key: 'client', value: clientMapValues});
    console.log(clientMapValues);
    ctx.send({ok: 200});
  },

  loginView: async (ctx, next) => {
    //su dung store de lay du lieu
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
    });

    // let alloweOrigin = await pluginStore.get({key: 'alloweOrigin'});
    
    const EXPIRE_TIME_TOTAL = await strapi.plugins['single-sign-on'].config.timeToExpire; //thoi gian ton tai 60s

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
    
    //neu serviceURL = http://consumer.ankuranand.in:3020 != true thi thong bao loi
    const { serviceURL } = ctx.query;
    if (serviceURL != null) {
      let url = new URL(serviceURL);

      if (alloweOrigin[url.origin] !== true) {
        return ctx.redirect(`/single-sign-on/login?error=notAllow`);
      }
    }

    if (infoUser != null && serviceURL != null) {
      ctx.state.session.expireTime = parseInt(new Date().getTime() / 1000) + EXPIRE_TIME_TOTAL;
      
      const url = new URL(serviceURL);
      await strapi.plugins['single-sign-on'].services.singlesignon.storeApplicationInCache(url.origin, infoUser.id, token);

      let urlService = url.origin + url.pathname + url.search + "?ssoToken=" + token;
      
      let client = await pluginStore.get({key: 'client'});
      // if(client[url.origin] === 'geoset'){
      if(client[url.origin] === true){
        urlService = url.origin + url.pathname + url.search + "&ssoToken=" + token;
      }
      
      return ctx.redirect(urlService);
    }

    const { error } = ctx.query;
    const layoutPath = path.join(strapi.config.appPath, 'plugins', 'single-sign-on', 'public', 'login.html');

    try {
      const layout = fs.readFileSync(layoutPath, 'utf8');
      const $ = cheerio.load(layout);

      // $('form').attr('action', '/auth/login');
      $('.error').text(_.isEmpty(error) ? '' : 'Wrong ...');

      if(error == 'userNotFound'){
        $('.error').text('Username is invalid');

      } else if (error == 'userBlocked'){
        $('.error').text('User is blocked');

      } else if (error == 'passwordInvalid'){
        $('.error').text('Username or Password is invalid');

      } else if(error == 'notAllow'){
        $('.error').text('You are not allowed to access the sso-server');
      } else if (error == 'unauthorized'){
        $('.error').text('Unauthorized!')
      }

      try {
        fs.writeFileSync(layoutPath, $.html());

        ctx.url = path.basename(`${ctx.url}/login.html`);
        return await strapi.koaMiddlewares.static(`./plugins/single-sign-on/public`)(ctx, next);

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
        return ctx.redirect(`/single-sign-on/login?error=userNotFound&serviceURL=${serviceURL}`);
      }
      return ctx.redirect(`/single-sign-on/login?error=userNotFound`);
    }

    //User bi khoa
    if (user.blocked === true) {
      if(serviceURL){
        return ctx.redirect(`/single-sign-on/login?error=userBlocked&serviceURL=${serviceURL}`);
      }
      return ctx.redirect(`/single-sign-on/login?error=userBlocked`);
    }

    //so sanh password nhap vao voi password tren CSDL
    const validPassword = strapi.plugins['users-permissions'].services.user.validatePassword(params.password, user.password);

    //sai password
    if (!validPassword) {
      if(serviceURL){
        return ctx.redirect(`/single-sign-on/login?error=passwordInvalid&serviceURL=${serviceURL}`);
      }
      
      return ctx.redirect(`/single-sign-on/login?error=passwordInvalid`);
    } else { 
      //service sso Post Login (trong file service users-permissions/services/sso.js)
      const urllogin = await strapi.plugins['single-sign-on'].services.singlesignon.ssoPostLogin(ctx, user);
      
      return ctx.redirect(urllogin);
    }

    return ctx.redirect('/');
  },

  verifySsoToken: async (ctx) => {
    console.log("172 verify SsooToken");
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'single-sign-on'
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
      // return ctx.badRequest(null, 'Your are not allowed to access the sso-server');
      return ctx.redirect(`/single-sign-on/login?error=notAllow`);
    }

    //neu User == null hoac sessionApp ko chua user tra ve thong bao loi ko co quyen dang nhap
    let sessionApp = await pluginStore.get({key: 'sessionApp'}); 
    
    if (infoUser == null || infoUser == undefined || sessionApp[globalSessionToken][appName] !== true) {
      // return ctx.response.forbidden('Unauthorized');
      return ctx.redirect(`/single-sign-on/login?error=unauthorized`);
    }
    
    if(infoUser != null){
      //ma hoa user sang token
      infoUser = {...infoUser, globalSessionID: globalSessionToken};
      let payload =  await strapi.plugins['single-sign-on'].services.singlesignon.generatePayload(infoUser);
      const ISSUER = "simple-sso";
      const token_sso = await strapi.plugins['users-permissions'].services.jwt.issue(payload, {issuer: ISSUER, expiresIn: '3m'});
      
      //xoa intrmTokenCahce sau khi da ma hoa user sang token
      delete intrmTokenCache[ssoToken];
      let value = {...intrmTokenCache}; 
      await pluginStore.set({ key: 'intrmTokenCache', value});

      return ctx.send({token: token_sso});
    }
  }
};
