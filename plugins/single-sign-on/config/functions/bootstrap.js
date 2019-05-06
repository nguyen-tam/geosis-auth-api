

module.exports = async cb => {
    const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'single-sign-on'
    });

    //SINGLE SIGN ON  ======================================================================================
  //originAppName
  if (!await pluginStore.get({key: 'originAppName'})) {
    var originAppName = {}
    
    await pluginStore.set({ key: 'originAppName', value: originAppName});  
  }

  //alloweOrigin
  if (!await pluginStore.get({key: 'alloweOrigin'})) {
    var alloweOrigin = {}
    
    await pluginStore.set({ key: 'alloweOrigin', value: alloweOrigin});  
  }
  
  //intrmTokenCache - 
  if (!await pluginStore.get({key: 'intrmTokenCache'})) {
    var intrmTokenCache = {}
    
    await pluginStore.set({ key: 'intrmTokenCache', value: intrmTokenCache});  
  }

  //appTokenDB
  if (!await pluginStore.get({key: 'appTokenDB'})) {
    var appTokenDB = {
      sso_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
      simple_sso_consumer: "1g0jJwGmRQhJwvwNOrY4i90kD0m"
    }
    
    await pluginStore.set({ key: 'appTokenDB', value: appTokenDB});  
  }
  
  //sessionUser
  if (!await pluginStore.get({key: 'sessionUser'})) {
    var sessionUser = {}
    
    await pluginStore.set({ key: 'sessionUser', value: sessionUser});  
  }

  //sessionApp
  if (!await pluginStore.get({key: 'sessionApp'})) {
    var sessionApp = {}
    
    await pluginStore.set({ key: 'sessionApp', value: sessionApp}); 
  }
  
  if (!await pluginStore.get({key: 'client'})) {
    var client = {}
    await pluginStore.set({ key: 'client', value: client}); 
  }
  //======================================================================================================

  cb();
  
};

