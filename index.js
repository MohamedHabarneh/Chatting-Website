'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
dotenv.config();
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const url = `mongodb+srv://chatBoxGroup:${process.env.MONGODB_PASS}@chatbox.rxzqy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')

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

const botName = 'ChatBox bot';

let clientSocketIds = [];
let connectedUsers= [];

const getSocketByUserId = (userId) =>{
    let socket = '';
    for(let i = 0; i<clientSocketIds.length; i++) {
        if(clientSocketIds[i].userId == userId) {
            socket = clientSocketIds[i].socket;
            break;
        }
    }
    return socket;
}

MongoClient.connect(url,(err,db)=>{
    
io.on('connection',(socket)=>{

    const dbo = db.db('chatBox')
    socket.emit('message', formatMessage(botName,'Welcome to ChatBox'));

    //Broadcast when a user connects
    socket.broadcast.emit('message',formatMessage(botName,'A user has joined the chat'));

    //runs when client disconnects
    socket.on('disconnect',()=>{
        io.emit('message',formatMessage(botName,'A user has left the chat'));
    });

    //Listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        io.emit('message',formatMessage('user',msg));
        dbo.collection('chats').insertOne({name:'user', message:msg},function(err,result){
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
                let myObj = new Object();
                myObj.username = username;
                myObj.status = 'online';
                dbo.collection('online').find(myObj).toArray(function(err,result2){
                    if(err) throw err;
                    if(result2.length == 1){
                        console.log('user is already online!')
                    }
                    else if(result2.length==0){
                        dbo.collection("online").insertOne(myObj, function(err, result3) {
                            if (err) throw err;
                            // console.log("inserted user to the online group",result3);
                            db.close()
                          });
                    }
                })
                res.send({status:true})
            } else {
                res.send({status:false})
            }
          });
        })
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

         
         dbo.collection('users').find(userObj).toArray(function(err,result){
            if(err) throw err;
            console.log(result)
            if(result.length==1){
                console.log('user is already registered')
            }
            else if(result.length==0){
                dbo.collection("users").insertOne(userObj,function(err,result){
                   if(err) throw err;
                })
            }
         })
    })
})

//gets users
app.get('/api/users', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("chatBox");
        dbo.collection('users').find({}).toArray((err, result) => {
            if (err) return console.log(err);
            console.log(result); //returns the object of users as an array i beleive?
            res.send(result);
          });
    })
}); 

server.listen(app.get('port'), function(){
	console.log('Express server started on http://localhost:' + app.get('port'));
	// console.log(__dirname)
})
