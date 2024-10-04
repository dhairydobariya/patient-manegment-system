let express = require("express")
let app = express()
let socketHandler = require("./socket.js");
let port = process.env.PORT || 4000
let  http = require('http');
let { Server } = require('socket.io');

let route = require('./route/route')
let adminroute = require('./route/adminRoute')
let doctorroute = require('./route/doctorRoutes')
let patientroute = require('./route/patientRoutes')
let passwordroute = require('./route/passwordRoutes')
let apointmentroute = require('./route/appointmentRoute.js')

let bodyparser = require('body-parser')

let mongoose =  require('./db/database')

let cookieparser = require('cookie-parser')

require('dotenv').config();


app.use(bodyparser.urlencoded({extended : true}))
app.use(express.json());
app.use(cookieparser())

app.use('/' , route)
app.use('/admin' , adminroute)
app.use('/doctor' , doctorroute)
app.use('/patient' , patientroute)
app.use('/password' , passwordroute)
app.use('/appointment', apointmentroute)

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});
io.on('connection', (socket) => {
  console.log('a user connected');
});

socketHandler(io);

server.listen(port , (req ,res) => {
    console.log(`port successfully run on ${port}`)
})

