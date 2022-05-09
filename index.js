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
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'


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
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body

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

	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			password
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})

server.listen(app.get('port'), function(){
	console.log('Express server started on http://localhost:' + app.get('port'));
	// console.log(__dirname)
})
