const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userLength = document.getElementById('user-length');
const inputChatMsg = document.getElementById('msg');
const typingMsg = document.querySelector('.typing-info');

//get data from params
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// Join chatroom
socket.emit('joinRoom', { 
    username: params.username, 
    room :params.room 
});

// it will catch server message here
socket.on('message', message => {
    console.log(message)
    displayChat(message)
      // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let inputMsg = e.target.elements.msg.value
    socket.emit('chatMsg', inputMsg)

    // Clear input
    e.target.reset();
})

function displayChat(message){
    typingMsg.innerHTML = ''
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.user;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.msg;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
  });

  // Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
  }
  
  // Add users to DOM
  function outputUsers(users) {
    userLength.innerHTML = `${users.length}`
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }
  
  //Prompt the user before leave chat room
  document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    } else {
    }
  });

inputChatMsg.addEventListener('keypress', function(){
    socket.emit('typing', params.username);
})

socket.on('typing', function(data){
  console.log(data)
  typingMsg.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  chatMessages.appendChild(typingMsg)
});