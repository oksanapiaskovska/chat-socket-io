var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var usersList = [];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function(req, res) {
  res.sendFile(__dirname + '/script.js');
});

io.on('connection', function(socket) {
  console.log('client connected');
  var userId = '';

  socket.on('chat message', function(msg) {
    messages.push(msg);
    if(messages.length >= 100) {
      messages.splice(0, 1);
    }
    io.emit('chat message', msg);
  });

  socket.on('new user', function(user) {
    userId = user.id;
    usersList.push(user);
    io.emit('new user', user);
    io.emit('chat history', messages);
    function userStatusOnline (user) {
      user && (user.statusColor = 'green');
      io.emit('user status', user);
    }
    setTimeout(userStatusOnline.bind(null, user), 60000);
  });
  socket.emit('users', usersList);

  socket.on('disconnect', function() {
    var user = usersList.find(usr => usr.id === userId);
    io.emit('user left', user);
    function userStatusOffline (user) {
      user && (user.statusColor = 'grey');
      io.emit('user status', user);
    }
    setTimeout(userStatusOffline.bind(null, user), 60000);
  });
});

http.listen(5000, function() {
  console.log('Listening on *: 5000');
});