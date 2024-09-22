// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  batchId: { type: String, required: true },
  status: {
    type: String,
    enum: ['assigned', 'unassigned', 'completed'],
    default: 'unassigned'
  }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
