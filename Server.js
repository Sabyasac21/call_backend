const express = require('express');


const cors = require('cors')
const multer = require('multer');
const contactRoutes = require('./routes/Contacts')
const authRoutes = require('./routes/Authroutes')
// const app = express();
const upload = multer();
require('dotenv').config();
const mongoConnection = require('./config/mongoConnection');


const app = express();
const port = 3002
app.use(cors())

app.use(express.json());
app.use('/api', authRoutes)
app.use('/api/dashboard', contactRoutes)


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})