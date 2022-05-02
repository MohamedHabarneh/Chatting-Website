'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const url = 'mongodb://localhost:27017/chatBox'
const socketio = require('socket.io')

const app = express();
app.set('port',3000)
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json());
app.use(cors())
app.use(express.static(__dirname+'/app'))



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


server.listen(app.get('port'), function(){
	console.log('Express server started on http://localhost:' + app.get('port'));
	// console.log(__dirname)
})
