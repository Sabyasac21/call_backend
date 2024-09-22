// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames are unique
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure emails are unique
    trim: true,
    lowercase: true, // Store emails in lowercase
  },
  assigned:{
    type:String,
    default:null
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
