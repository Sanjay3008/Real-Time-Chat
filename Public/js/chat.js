// MongoDB
let x = document.cookie;
const username = document.getElementById('member').textContent;
const group_name = document.getElementById('group-name-t').textContent;
// const { username, group_name } = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// })



const chatMessages = document.getElementById('chat-group-msgs');

const socket = io();
// join group




socket.emit('joinRoom', { username, group_name })


socket.on('admin-message', message => {

    const div = document.createElement('div');
    div.classList.add('message-admin');
    div.innerHTML = `<p class="meta-admin">${message.text} </h6>  `

    document.getElementById('chat-group-msgs').appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;


})

socket.on('own-message', message => {

    const div = document.createElement('div');
    div.classList.add('message-outgoing');
    div.innerHTML = `<p class="meta">${message.name} <span align="right">${message.time}</span> </p> 
    <p class="text-msg"> 
    ${message.text} 
    </p>`

    div.style.backgroundColor = '#fff';
    div.setAttribute('margin-left', 'auto');

    document.getElementById('chat-group-msgs').appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

});



/* ---------------------------------------------------------------------- */





// Get username and Room


socket.on('other-message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

})



// Get Username and Room


//Message submits

const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // emitting a message to server
    socket.emit('chat-msg', msg);



    //sendMessage(msg);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})


// Output Message to dom

function outputMessage(message) {

    console.log(message);
    const div = document.createElement('div');
    div.classList.add('message-incomming');
    div.innerHTML = `<p class="meta">${message.name} <span>${message.time}</span> </p> 
    <p class="text-msg"> 
    ${message.text} 
    </p>`

    div.style.backgroundColor = "#D6BF8F";
    div.setAttribute('align', 'left');

    document.getElementById('chat-group-msgs').appendChild(div);
}



// room name and users list

socket.on('roomUsers', ({ group_name, users }) => {

    outputUsers(users);
})

function outputRoomName(group_name) {
    const roomName = document.getElementById('group-name-t');

    roomName.innerText = group_name;
}

function outputUsers(users) {

    const list = document.getElementById('members-list');

    list.innerHTML = `${ users.map(user => `<div class="member">${user.username}</div>`).join('')}`;

}

console.log(document.getElementById('group-name-t').textContent);