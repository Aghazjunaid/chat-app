const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const utils = require("./utils")();
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// socket.broadcast.emit() will emit to msg to everybody except the user which is connecting
// io.emit to send msg to all the clients(everbody)
// socket.emit to send message to client from server(to the single client)
// socket.on to listen message 
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }) => {
    const user = utils.userJoin(socket.id, username, room);

    socket.join(user.room);

    // send message to client from server(to the single client)
    socket.emit('message',{
      user : "Jarvis  ",
      msg : 'Welcome to chit-chat',
      time : utils.getNowTime()
    })

    // Broadcast when a user connects(to specific room)
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        {
          user : "Jarvis  ",
          msg : `${user.username} has joined the chat`,
          time : utils.getNowTime()
        }
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: utils.getRoomUsers(user.room)
    });
  });

  //Listen input message
  socket.on('chatMsg', (inputMsg) => {
    const user = utils.getCurrentUser(socket.id);
    io.to(user.room).emit('message',{
      user: user.username,
      msg : inputMsg,
      time : utils.getNowTime()
    })
  })

  socket.on('typing', function(data){
    const user = utils.getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('typing', data);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = utils.userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        {
          user : "Jarvis  ",
          msg : `${user.username} has left the chat`,
          time : utils.getNowTime()
        }
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: utils.getRoomUsers(user.room)
      });
    }
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
