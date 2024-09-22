const mongoose = require('mongoose');
const uri = process.env.mongo_uri
console.log(uri, 'from .env');
const connection =  mongoose.connect(uri).then(()=>{
    console.log("connected to database");
}).catch((error)=>{
    console.log(`not connected to database: ${error.message}`);
})

module.exports =  connection;