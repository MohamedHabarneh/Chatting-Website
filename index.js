'use strict'

const express = require('express')
const cors = require('cors')
const http = require('http')
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const url = 'mongodb://localhost:27017/test1'
const socketio = require('socket.io')

const app = express();
app.set('port',3000)
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json());
app.use(cors())
app.use(express.static(__dirname+'/app'))


// MongoClient.connect(url,(err,db)=>{
//     if(err) throw err;
//     console.log('connected mongodb!')
//     db.close()
// });

server.listen(app.get('port'), function(){
	console.log('Express server started on http://localhost:' + app.get('port'));
	// console.log(__dirname)
})