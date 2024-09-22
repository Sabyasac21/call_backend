const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const authenticateToken = async (req, res, next) => {
    console.log('aaya idhar', req.headers['authorization'].split(' ')[1]);
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.sendStatus(401); 
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); 
        console.log(decoded.id, 'checking token verifiction..');
        

        
        const user = await User.findById(decoded.id); 
        console.log(user, 'user from middleware..');

        if (!user) {
            return res.sendStatus(404); 
        }

        req.user = user; 
        next(); 
    } catch (error) {
        console.error(error);
        return res.sendStatus(403); 
    }
};

module.exports = authenticateToken;
