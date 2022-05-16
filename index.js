'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
dotenv.config();
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
<<<<<<< Updated upstream
const url = `mongodb+srv://chatBox_CPSC349:${process.env.MONGODB_PASS}@chatbox.vfom0.mongodb.net/test`
=======
const url = `mongodb+srv://chatBoxGroup:${process.env.MONGODB_PASS}@chatbox.rxzqy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

>>>>>>> Stashed changes
const socketio = require('socket.io')

const app = express();
app.set('port',3000)
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json());
app.use(cors())
app.use(express.static(__dirname+'/app'))

//My needed libs
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const alert = require('alert')


MongoClient.connect(url,(err,db)=>{
<<<<<<< Updated upstream
    if(err) throw err;
    console.log('connected mongodb!')
    io.on('connect',function(socket){
        const dbo = db.db('chatBox')
        
        const sendStatus = (s) =>{
            socket.emit('status',s)
        }

        //get chats from collection
        dbo.collection('chats').find().limit(50).sort({_id:1}).toArray(function(err,result){
            if(err) throw err
            
            //emit messages
            socket.emit('output',result)
        })
        socket.on('input',function(data){
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                sendStatus('Please enter a name and message.');
            }else{
                //Insert into db
                dbo.collection('chats').insertOne({name, message},function(){
                    io.emit('output',[data]);
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    })
                })
            }
        });

        //Handle clear 
        socket.on('clear', function(data){
            //remove chats
            dbo.collection('chats').deleteMany({},function(){
                socket.emit('cleared');
            })
        })
    })
=======

    const dbo = db.db('chatBox')
    const projection = { _id: 0, username: 1};
    dbo.collection('online').find({}).project(projection).toArray((err, result) => {
        if (err) return console.log(err);
        const user = result[(result.length) - 1].username;
        io.on('connection',(socket)=>{
            //console.log(dbo.table.find({}, { array: { $slice: -1 } }));
            socket.emit('message', formatMessage(botName,'Welcome to ChatBox'));

            //Broadcast when a user connects
            socket.broadcast.emit('message',formatMessage(user,'A user has joined the chat'));

            //runs when client disconnects
            socket.on('disconnect',()=>{
                io.emit('message',formatMessage(user,'A user has left the chat'));
            });

            //Listen for chatMessage
            socket.on('chatMessage',(msg)=>{
                io.emit('message',formatMessage(user,msg));
                dbo.collection('chats').insertOne({name:user, message:msg},function(err,result){
                    if(err) throw err;
                })
            })

            socket.on('clear', function(data){
                //remove chats
                dbo.collection('chats').deleteMany({},function(){
                    socket.emit('cleared');
                })
            })

            //when they login not being used rn idk how to use it
            socket.on('loggedin', function(user) {
                clientSocketIds.push({socket: socket, userId:  user.user_id});
                connectedUsers = connectedUsers.filter(item => item.user_id != user.user_id);
                connectedUsers.push({...user, socketId: socket.id})
                io.emit('updateUserList', connectedUsers)
            });
        });
    });
>>>>>>> Stashed changes
});


app.use(bodyParser.json())


app.post('/api/login', async (req, res) => {
    MongoClient.connect(url, function(err,db){
        if(err) throw err;
        const dbo = db.db("chatBox"); //this connect to db
        const { username, password} = req.body
        var query = {username: username, password: password};
        dbo.collection("users").find(query).toArray(function(err, result) {
            if (err) throw err;
            if(result.length == 1) {
                console.log("User was found")
<<<<<<< Updated upstream
                res.send({status:true, data: result[0]})
            } else {

                res.send({status:false})
            }
            var myobj = { username: username, status: "online" };
            dbo.collection("online").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("inserted user to the online group");
                alert("Login successful!")
                db.close()
              });
            $('#login').hide();
            $('#after-login').show();
            console.log(result);
          });
        })
=======
                var myobj = { username: username, status: "online" };
                dbo.collection("online").insertOne(myobj, function(err, result2) {
                    if (err) throw err;
                    let foundUser = true;
                    console.log("inserted user to the online group");
                    db.close()
                });
                res.send({ status: 'ok' }); //sends the ok status for login.html to move onto new screen
            } else {
                result2.send({status:false})
            }
            console.log(result);
        });
    })
>>>>>>> Stashed changes
    console.log("done with function")
})


app.post('/api/register', async (req, res) => {
    console.log(req.body)
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        const dbo = db.db("chatBox"); // connect to db

        const { username, password: plainTextPassword } = req.body
        const password =  bcrypt.hash(plainTextPassword, 10)
        console.log(password)
        if (!username || typeof username !== 'string') {
            return res.json({ status: 'error', error: 'Invalid username' })
        }
    
        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return res.json({ status: 'error', error: 'Invalid password' })
        }
    
        if (plainTextPassword.length < 5) {
            return res.json({
                status: 'error',
                error: 'Password too small. Should be atleast 6 characters'
            })
        }
         let userObj = new Object();
         userObj.username = req.body.username;
         userObj.password = req.body.password;

         dbo.collection("users").insertOne(userObj,function(err,result){
            if(err) throw err;
            else{
                res.type('application/json')
                res.status(200)
                res.json(result)
            }
         })
    })
})

server.listen(app.get('port'), function(){
	console.log('Express server started on http://localhost:' + app.get('port') + '/login.html');
	// console.log(__dirname)
})
