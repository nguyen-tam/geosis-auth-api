'use strict';

// const uuidv4 = require("uuid/v4");
// const Hashids = require("hashids");
// const hashids = new Hashids();

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