const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const newUser = new User({ name, email, phone, password, role: 'user' });
        await newUser.save();
        res.json({ success: true, message: "User created!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Hardcoded Admin logic for safety
        if (email === 'admin@freshmart.com' && password === 'admin') {
            return res.json({ success: true, user: { name: 'Admin', email, role: 'admin' } });
        }
        
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
