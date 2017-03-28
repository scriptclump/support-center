
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./server/config/config')[env];

var serverRestartTimeInMin = require('./server/config/config')['serverRestartTimeInMin'];


var mailConfig = require('./server/config/config')['mailListener'];

require('./server/config/mongoose')(config);

require('./server/config/maillistener')(mailConfig);

setInterval(function(serverRestartTimeInMin){
   console.log('Server Restart Set at every ',serverRestartTimeInMin,Date.now());
   console.log('Now restart',RestartNow);
},parseInt(serverRestartTimeInMin)*60000,serverRestartTimeInMin);