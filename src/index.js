const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    console.log('New Client connected');

    socket.on('join', ({ username, room }, callback) => {

        const { err, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if(err){
            return callback(err)
        }


        socket.join(user.room);

        socket.emit('message', generateMessage("","Welcome"));
        socket.broadcast.to(user.room).emit('message', generateMessage('',`${user.username} has joined!`));
        io.to(user.room).emit('room-data',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        //
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id)
        if (filter.isProfane(msg)) {
            return callback('Language!')
        }

        io.to(user.room).emit('message', generateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${message.latitude},${message.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('',`A ${user.username} has left!`))
            io.to(user.room).emit('room-data',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, () => { console.log('Server is up on port 3000.') })  