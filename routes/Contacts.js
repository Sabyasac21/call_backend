// routes/contact.js
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser'); // Make sure to install this package
const fs = require('fs');
const Contact = require('../models/Contacts');
const { v4: uuidv4 } = require('uuid'); 
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middlewares/AuthMiddleware')
const User = require('../models/User')

router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('i came here...');
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const bufferStream = new require('stream').Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);
  const batchId = Date.now().toString()
  console.log(batchId);

  bufferStream
    .pipe(csv())
    .on('data', async (data) => {
      const { Name, 'Phone Number':phoneNumber } = data;
      if (Name && phoneNumber) {
        results.push({ name:Name, phoneNumber: phoneNumber, batchId });
      }
    })
    .on('end', async () => {
      try {
        console.log(results, 'service layer');
        await Contact.insertMany(results);
        res.status(200).send('Contacts saved successfully!');
      } catch (error) {
        res.status(500).send('Error saving contacts: ' + error.message);
      }
    })
    .on('error', (error) => {
      res.status(500).send('Error processing file: ' + error.message);
    });
});


// New route to get contacts segregated by batchId in increasing order
router.get('/contacts-by-batch', async (req, res) => {
  try {
    // Fetch contacts and sort by batchId in increasing order
    const contacts = await Contact.find().sort({ batchId: 1 });
    console.log(contacts);
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Error fetching contacts: ' + error.message);
  }
});

router.get('/contacts/:batchId', async (req, res) => {
  const { batchId } = req.params;
  console.log(req.params, 'from inside...');
  try {
      const contacts = await Contact.find({ batchId });
      res.json(contacts);
  } catch (error) {
      res.status(500).json({ error: 'Error fetching contacts' });
  }
});

router.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
      const updatedContact = await Contact.findByIdAndUpdate(id, { status }, { new: true });
      if (!updatedContact) {
          return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(updatedContact);
  } catch (error) {
      res.status(500).json({ error: 'Error updating contact' });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
      const contactId = req.params.id;
      const { status } = req.body;
      console.log(contactId, status, 'from backend');

      // Update contact status
      const contact = await Contact.findByIdAndUpdate(contactId, { status }, { new: true });
      if (!contact) {
          return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json({ message: 'Contact status updated', contact });
  } catch (error) {
      res.status(500).json({ message: 'Error updating contact', error });
  }
});

router.put('/user/assign', authMiddleware, async (req, res) => {
  try {
      const userId = req.user._id; // Assuming user is authenticated and you have access to user ID
      const { assigned } = req.body;

      // Update user's assigned contact to null
      const user = await User.findByIdAndUpdate(userId, { assigned }, { new: true });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User assignment updated', user });
  } catch (error) {
      res.status(500).json({ message: 'Error unassigning user', error });
  }
});

router.get('/check-assigned/:batchId', authMiddleware, async (req, res) => {
  try {
    
      const userId = req.user._id; // Assuming the user is authenticated
      const batchId = req.params.batchId;

      console.log(userId, batchId, 'came here..');

      // Find the user and check if their assigned contact belongs to the batch
      const user = await User.findById(userId)
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      // console.log(user, 'user has fetched..');
      const contact = user.assigned
      
      if (contact===null){
        console.log('contact is null');
        return res.status(200).json({isAssigned:true})
      }
      // console.log(contact, 'contact has fetched..');
      const contactResponse = await Contact.findOne({_id:contact});
      // console.log(contactResponse, 'check it here');
      const contactBatch = contactResponse.batchId
      
      // console.log(contactBatch,  'contact batch has fetched..');
      // console.log(contactBatch, 'from routes backend');
      if ( contactBatch===batchId){
        // console.log('sai box hai..');
        return res.status(200).json({ message:'User can choose this batch' , isAssigned:true});
      }else{
        // console.log('galat box h..');
        return res.status(200).json({ message:'User cannot choose this batch', isAssigned:false});
      }

    
  } catch (error) {
      res.status(500).json({ message: 'Error checking assignment', error });
  }
});


router.get('/isAssigned', authMiddleware, async(req, res)=>{
  try {
    console.log('heyy');
    const userId = req.user._id
    const user = await User.findById(userId)
    if (user.assigned){
      console.log('user assigned');
      const contact = await Contact.findOne({ _id:user.assigned})
      console.log(contact, 'checking herre..');

      return res.status(200).json({data:contact.batchId})
    }else{
      return res.status(200).json({data:null})
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking assignment', error });
    
  }
})

router.post('/leave-process', authMiddleware, async(req, res)=>{
  try {
    console.log('came here..');
    const userId = req.user._id
    const  user = await User.findById(userId)
    console.log(user,  'user has fetched..');
    const contactId = user.assigned
    console.log(contactId,  'contact id has fetched..');
    const updateContactResponse = await Contact.findByIdAndUpdate(contactId, {status:'unassigned'})
    const updateUserResponse = await User.findByIdAndUpdate(userId, {assigned:null})
    console.log(updateContactResponse, updateUserResponse,  'update response has fetched..');
    return res.status(200).json({message:'User has left the batch'})
    } catch (error) {
      res.status(500).json({ message: 'Error leaving batch', error });
      }

})





module.exports = router;
