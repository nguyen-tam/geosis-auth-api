

module.exports = async cb => {
    const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'single-sign-on'
    });

    //SINGLE SIGN ON  ======================================================================================
  //originAppName
  if (!await pluginStore.get({key: 'originAppName'})) {
    var value = {
      "http://consumer.ankuranand.in:3020": "sso_consumer",
      "http://consumertwo.ankuranand.in:3030": "simple_sso_consumer",
      "http://localhost:3000": "sso_consumer",
      "http://172.16.1.188" : "sso_consumer"
    }
    
    await pluginStore.set({ key: 'originAppName', value});  
  }

  //alloweOrigin
  if (!await pluginStore.get({key: 'alloweOrigin'})) {
    var value = {
      "http://consumer.ankuranand.in:3020": true,
      "http://consumertwo.ankuranand.in:3030": true,
      "http://localhost:3000": true,
      "http://sso.ankuranand.in:3080": false,
      "http://172.16.1.188" : true
    }
    
    await pluginStore.set({ key: 'alloweOrigin', value});  
  }
  
  //intrmTokenCache - 
  if (!await pluginStore.get({key: 'intrmTokenCache'})) {
    var intrmTokenCache = {}
    
    await pluginStore.set({ key: 'intrmTokenCache', intrmTokenCache});  
  }

  //appTokenDB
  if (!await pluginStore.get({key: 'appTokenDB'})) {
    var appTokenDB = {
      sso_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
      simple_sso_consumer: "1g0jJwGmRQhJwvwNOrY4i90kD0m"
    }
    
    await pluginStore.set({ key: 'appTokenDB', appTokenDB});  
  }
  
  //sessionUser
  if (!await pluginStore.get({key: 'sessionUser'})) {
    var sessionUser = {}
    
    await pluginStore.set({ key: 'sessionUser', sessionUser});  
  }

  //sessionApp
  if (!await pluginStore.get({key: 'sessionApp'})) {
    var sessionApp = {}
    
    await pluginStore.set({ key: 'sessionApp', sessionApp}); 
  }

  if (!await pluginStore.get({key: 'client'})) {
    var client = {
      "http://localhost:3000": "geoset",
    }
    
    await pluginStore.set({ key: 'client', client}); 
  }
  //======================================================================================================

  cb();
  
};

