'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv = require('dotenv')
dotenv.config();
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const url = `mongodb+srv://chatBox_CPSC349:${process.env.MONGODB_PASS}@chatbox.vfom0.mongodb.net/test`
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
	console.log('Express server started on http://localhost:' + app.get('port'));
	// console.log(__dirname)
})
