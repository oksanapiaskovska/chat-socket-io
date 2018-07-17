(function() {
  var loginBtn = document.getElementById('loginBtn');
  var userFormArea = document.getElementById('userFormArea');
  var messageArea = document.getElementById('messageArea');
  var nameInput = document.getElementById('nameInput');
  var nickInput = document.getElementById('nickInput');
  var usersList = document.getElementById('usersList');
  var text = document.getElementById('text');
  var textSubmit = document.getElementById('textSubmit');
  var messages = document.getElementById('messages');

  var userName = 'User Name';
  var userNick = 'userNick';

  var socket = io.connect();
  
  loginBtn.onclick = () => {
    userFormArea.style.display = 'none';
    messageArea.style.display = 'flex';
    userName = nameInput.value;
    userNick = nickInput.value;
    var inf = {
      name: userName,
      nick: userNick,
      id: (new Date()).getTime(),
      statusColor: 'yellowgreen'
    };
    socket.emit('new user', inf);
  };

  socket.on('users', function(user) {
    for(var i in user) {
      if(user.hasOwnProperty(i)) {
        createUser(user[i]);
      }
    } 
  });

  function createUser (user) {
    var li = document.createElement('li');
    li.classList.add('user');
    li.id = user.id;
    li.innerHTML = `<i class="fas fa-circle"></i>${user.name} (${user.nick})`;
    usersList.appendChild(li);
    var i = li.getElementsByTagName('i')[0];
    i.style.color = user.statusColor;
  }

  socket.on('new user', createUser);

  textSubmit.onclick = () => {
    var data = {
      name: userName,
      text: text.value,
      nick: userNick
    };
    text.value = '';
  
    socket.emit('chat message', data);
  };
  
  socket.on('chat history', function(msg) {
    messages.innerHTML = '';
    for(var i in msg) {
      createMessage(`${msg[i].name}: ${msg[i].text}`);      
    }
  });

  function isSelected (msg) {
    return msg.includes(`@${userNick}`);
  }

  function createMessage (msg) {
    var el = document.createElement('li');
    var childs = messages.querySelectorAll("*");
    if(childs.length >= 100) {
      messages.removeChild(childs[0]);
    }
    el.classList.add('list-group-item');
    if (isSelected(msg)) {
      el.classList.add('selected');
    }
    el.textContent = msg;
    messages.appendChild(el);
  }
  
  socket.on('chat message', function(msg) {
    createMessage(`${msg.name}: ${msg.text}`);
  });

  socket.on('user left', user => {
    var li = document.getElementById(user.id);
    var i = li.getElementsByTagName('i')[0];
    createMessage(`User: ${user.name} (${user.nick}) left chat`)
    i.style.color = 'red';
  });

  socket.on('user status', user => {
    var li = document.getElementById(user.id);
    var i = li.getElementsByTagName('i')[0];
    i.style.color = user.statusColor;
  });
})();