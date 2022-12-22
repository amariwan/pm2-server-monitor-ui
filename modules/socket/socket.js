const httpServer = require('../http/http');
const socketIo = require('socket.io');
const io = socketIo(httpServer); // Creating a socket.io server and attaching it to the http server.
const app = require('../../app');
app.set('socketio', io);
