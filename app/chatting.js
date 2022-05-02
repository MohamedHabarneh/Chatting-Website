

let currentStatus = document.getElementById("status")
let messages = document.getElementById("chat-messages")
let textarea = document.getElementById("msg")
let username = document.getElementById("username")
let sendBtn = document.getElementById('send-btn')
let clearBtn = document.getElementById("clear-btn")

document.querySelector('form.pure-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    console.log(username.value)
})

    const statusDefault = currentStatus.textContent;

    const setStatus = function(s){
        currentStatus.textContent = s; 
        if(s !== statusDefault){
            const delay = setTimeout(function(){
                setStatus(statusDefault)
            },4000)
        }
    }

//connect to socket.io

let socket = io.connect('http://localhost:3000');



//check for connection
if(socket !== undefined){
    socket.on('output',function(data){
        if(data.length){
            for(let x = 0; x<data.length; x++){
                let message = document.createElement('div');
                message.setAttribute('class','chat-message');
                message.textContent = data[x].name+": "+ data[x].message;
                messages.appendChild(message);
                messages.insertBefore(message,messages.firstChild)
            }
            for(let i = 1; i<messages.childNodes.length;i++){
                messages.insertBefore(messages.childNodes[i],messages.firstChild)
            }
            // messages.append(...Array.from(messages.childNodes).reverse());  
        }
    })
    socket.on('status',function(data){
        
        //get message status
        setStatus((typeof data === 'object')? data.message : data);

        if(data.clear){
            textarea.value = '';
        }
    })

    //handle input
    document.querySelector('form.msg-form').addEventListener('submit',function(e){
        e.preventDefault();
        console.log(textarea.value)
    })
    textarea.addEventListener('keyup',function(event){
        event.preventDefault();
        if(event.key === 'Enter' && event.shiftKey == false){
            socket.emit('input',{
                name: username.value,
                message: textarea.value
            })
        }
    })

    clearBtn.addEventListener('click',function(){
        socket.emit('clear')
    })

    socket.on('cleared',function(){
        messages.textContent = '';
    })
}

