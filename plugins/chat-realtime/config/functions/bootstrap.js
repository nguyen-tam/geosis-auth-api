

module.exports = async cb => {
  //Chat Realtime ======================================================================================
    console.log("Bootstrap chat realtime  plugin");
    var io = require('socket.io')(strapi.server);

    io.on('connection', function(socket){
      socket.emit('hello', JSON.stringify({message: 'Hello everyone'}));

      socket.on('newMessage', data =>{ 
        io.emit('newMessage', data);
        console.log(data);
      });

      socket.on('disconnect', () => console.log('a user disconnected'));
    });

    strapi.io = io;
  //======================================================================================================

  cb();
  
};

