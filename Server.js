const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors')

const app = express();
const port = 3002
app.use(cors({
    origin: 'http://localhost:5173'  // Allow your frontend's origin
  }));
const server = http.createServer(app); 
const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:5173',  // Your frontend URL
      methods: ['GET', 'POST']
    }
  });
   



const multer = require('multer');
const contactRoutes = require('./routes/Contacts')(io)
const authRoutes = require('./routes/Authroutes')
// const app = express();
const upload = multer();
require('dotenv').config();
const mongoConnection = require('./config/mongoConnection');







io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Optionally handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

app.use(express.json());
app.use('/api', authRoutes)
app.use('/api/dashboard', contactRoutes)


server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})