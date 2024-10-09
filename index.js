let express = require("express");
let app = express();
let port = process.env.PORT || 4000;

const http = require('http');
const socketIo = require('socket.io');
const chatRoutes = require('./route/chatRoute.js'); // Chat routes
const { saveChatMessage } = require('./controllers/chatcontroller.js');

let route = require('./route/route');
let billroute = require('./route/billroute.js');
let adminroute = require('./route/adminRoute');
let doctorroute = require('./route/doctorRoutes');
let patientroute = require('./route/patientRoutes');
let passwordroute = require('./route/passwordRoutes');
let apointmentroute = require('./route/appointmentRoute.js');
let prescriptionsroute = require('./route/prescriptionRoutes.js');
let teleconsultationroute = require('./route/teleconsulationRoute.js');

let bodyparser = require('body-parser');
let mongoose = require('./db/database');
let cookieparser = require('cookie-parser');

require('dotenv').config();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins, modify if needed
    methods: ['GET', 'POST']
  }
});

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());

app.use('/', route);
app.use('/bill', billroute);
app.use('/chats', chatRoutes); // Chat routes
app.use('/admin', adminroute);
app.use('/doctor', doctorroute);
app.use('/patient', patientroute);
app.use('/password', passwordroute);
app.use('/appointment', apointmentroute);
app.use('/prescriptions', prescriptionsroute);
app.use('/teleconsultation', teleconsultationroute);

// Socket.io implementation
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room for real-time chat based on doctor and patient
  socket.on('joinRoom', ({ doctorId, patientId }) => {
    const roomId = `${doctorId}_${patientId}`;
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Listen for chat messages and save to database
  socket.on('chatMessage', async ({ doctorId, patientId, message, senderId, senderModel }) => {
    if (!doctorId || !patientId || !message || !senderId || !senderModel) {
      socket.emit('error', 'Invalid message data');
      return;
    }

    const roomId = `${doctorId}_${patientId}`;

    try {
      // Save the chat message to the database
      const newMessage = await saveChatMessage(doctorId, patientId, message, senderId, senderModel);

      // Emit the new message to the specific room (doctor-patient room)
      io.to(roomId).emit('message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Message could not be saved');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});
