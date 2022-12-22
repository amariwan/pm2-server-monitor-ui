const httpServer = require('./modules/http/http');
const socketIo = require('socket.io');
const io = socketIo(httpServer); // Creating a socket.io server and attaching it to the http server.

app.set('socketio', io);
