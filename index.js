require('./db/conn')
const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require('cors')
const bodyParser = require('body-parser')
const router = express.Router()

const {create_room, join_room, player_ready, cross, bingo} = require('./controllers/room')


const { instrument } = require("@socket.io/admin-ui");

router.get("/", (req, res) => {
    res.send({ response: "Server is up and running." }).status(200);
  });

app.use(cors())
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://bingogame-ycry.vercel.app");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', "https://admin.socket.io", 'http://192.168.1.69:3000', 'https://bingogame-ycry.vercel.app'],
        credentials: true,
        allowEIO3: true
    }
}) 

instrument(io, {
    auth: false
  });

io.on("connection", socket => {

    socket.on('player_ready', async (room, cb) => player_ready(room, socket, io, cb))
    socket.on('cross', async (room, num, current_turn, cb) => cross(room, num, current_turn, io, cb))
    socket.on('bingo', (room, cb) => bingo(room, socket, io, cb))

    socket.on('join_room', (room, name, cb) => {
        join_room(room, false, {id: socket.id, name: name}, socket, cb)
      
    })
    socket.on('create_room', (name, cb) => create_room({id:socket.id, name:name}, socket, io, cb))
    socket.on('random_room', async (cb) => join_room('', true, {id: socket.id, name: ''}, socket, io, cb))
    socket.on('append_player', async (room, name, cb) => join_room(room, false, {id: socket.id, name:name}, socket, io, cb))
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
})