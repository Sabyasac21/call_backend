const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middlewares/AuthMiddleware')
const Contact = require('../models/Contacts')

const router = express.Router()

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('passed');
        const user = await User.findOne({ email });
        
        if (!user) return res.status(401).json({ message: 'User not found' });
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' })
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)
        res.status(200).json({ token })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/register', async (req, res) => {
    // console.log(req.body);
    const { username, email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' })
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        console.log(newUser);
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY);
        console.log(token, 'token');
        res.status(201).json({ token, data: { newUser, token } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/user', authMiddleware, async (req, res) => {
    try {
        console.log(req.user, 'aagye');
        const user = await User.findById(req.user.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }


})

router.put('/user/assign', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { assigned: req.body.assigned }, { new: true });
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

router.get('/user/asignee', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        console.log(user.assigned, 'from inner');
        const assignedContact = await Contact.findOne({ _id: user.assigned })
        res.status(200).json(assignedContact)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }


})



module.exports = router;