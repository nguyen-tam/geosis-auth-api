'use strict';

// const uuidv4 = require("uuid/v4");
// const Hashids = require("hashids");
// const hashids = new Hashids();
const _ = require('lodash');

module.exports = {
    generatePayload: (user) => {
        const payload ={
            role: user.role.name,
            email: user.email,
            username: user.username,
            uid: user.id,
            globalSessionID: user.globalSessionID
        }
        return payload;
    },

    ssoPostLogin: async (ctx, user, serviceURL = null) => {
        //==========================================Single Sign On===========================================================
        const store = await strapi.store({
            environment: '',
            type: 'plugin',
            name: 'users-permissions'
        });
        
        let client = await store.get({key: 'client'});

        //luu sessionUser
        let sessionUser = await store.get({key: 'sessionUser'});
        let value = {...sessionUser}; 
        value[user.id] =  user.email; // {'5c887b6c3bf6621a7c138025': 'huynh.nguyen356@gmail.com'}
        await store.set({ key: 'sessionUser', value});
        
        const ssoToken = strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user.toJSON ? user.toJSON() : user, ['_id', 'id']));
        const postLogInUser = await strapi.plugins['users-permissions'].services.jwt.verify(ssoToken);
        
        //luu user, Token, expireTime  vao session
        const EXPIRE_TIME_TOTAL =  await strapi.plugins['users-permissions'].config.timeToExpire; //60 - set expire time = 60s
        ctx.state.session.user = user;                                                            
        ctx.state.session.token = ssoToken;
        ctx.state.session.exp = postLogInUser.exp;                                                //thoi gian song cua user dang nhap
        ctx.state.session.expireTime = parseInt(new Date().getTime() / 1000) + EXPIRE_TIME_TOTAL;        

        //neu serviceURL khac null thi chuyen trang sang serviceURL
        if(ctx.request.query && ctx.request.query.serviceURL != undefined){
          serviceURL  = ctx.request.query.serviceURL;
          
            //Luu intrmTokenCache sau moi lan post login =={ D5K3QE1966IYp7qBZ7kofVMLGKQ: [ '5c887b6c3bf6621a7c138025', 'sso_consumer' ] }
            const url = new URL(serviceURL);
            await strapi.plugins['users-permissions'].services.sso.storeApplicationInCache(url.origin, user.id, ssoToken);

            //chuyen trang sang serviecURL == http://consumer.ankuranand.in:3020?ssoToken=Abc.def.xyz
            let urlLogIn = serviceURL + "?ssoToken=" + ssoToken;
            if(client[url.origin] === 'geoset'){
                urlLogIn = serviceURL + "&ssoToken=" + ssoToken;
            }
            
            return urlLogIn;
        }
        //==========================================End Single Sign On=======================================================
    },

    fillIntrmTokenCache: async (origin, id, intrmToken) => {

        const pluginStore = strapi.store({
            environment: '',
            type: 'plugin',
            name: 'users-permissions'
        });
        let intrmTokenCache = await pluginStore.get({key: 'intrmTokenCache'});
        let originAppName = await pluginStore.get({key: 'originAppName'});
        let value = {...intrmTokenCache};
        // let value = {};
        value[intrmToken] =  [id, originAppName[origin]];
        await pluginStore.set({ key: 'intrmTokenCache', value});
    },
    
    storeApplicationInCache: async (origin, id, intrmToken) => {

        const pluginStore = strapi.store({
            environment: '',
            type: 'plugin',
            name: 'users-permissions'
        });

        let originAppName = await pluginStore.get({key: 'originAppName'});
        let sessionApp = await pluginStore.get({key: 'sessionApp'});
        if (sessionApp[id] == null) {
            let value = {...sessionApp};
            // let value = {};
            value[id] =  { [originAppName[origin]]: true };
            await pluginStore.set({ key: 'sessionApp', value});
            
            strapi.plugins['users-permissions'].services.sso.fillIntrmTokenCache(origin, id, intrmToken);
        } else{
            let value = {...sessionApp};
            // let value = {};
            value[id][originAppName[origin]] =  true;
            await pluginStore.set({ key: 'sessionApp', value});
            strapi.plugins['users-permissions'].services.sso.fillIntrmTokenCache(origin, id, intrmToken);    
        }    
    },
};