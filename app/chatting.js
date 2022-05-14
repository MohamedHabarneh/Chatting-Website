const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const clearBtn = document.getElementById('clear-btn')
const logoutBtn = document.getElementById("logout-btn")
//get username and room from url

// const {username,password} = Qs.parse(window.location.search,{
//     ignoreQueryPrefix: true
// });



const socket = io();


for(const key of window.localStorage.getItem('token')){
    console.log(window.localStorage.getItem('token')[key])
}

socket.on('message', (message)=>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit 

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;   

    //emit msg to server
    socket.emit('chatMessage',msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text"> ${message.text}</p>`;
    document.querySelector('div.chat-messages').appendChild(div);
}


clearBtn.addEventListener('click',function(){
    socket.emit('clear')
})

socket.on('cleared',function(){
    chatMessages.textContent = '';
})



logoutBtn.addEventListener('click', function(event){
    event.preventDefault()
    console.log("GOING TO LOG OUT")
})