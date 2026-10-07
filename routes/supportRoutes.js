const express = require('express');
const router = express.Router();
const Support = require('../models/Support');

// GET all support tickets
router.get('/', async (req, res) => {
    try {
        const tickets = await Support.find().sort({ _id: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new ticket (User)
router.post('/', async (req, res) => {
    try {
        const newTicket = new Support(req.body);
        const savedTicket = await newTicket.save();
        res.json(savedTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT resolve ticket (Admin)
router.put('/:id', async (req, res) => {
    try {
        const ticket = await Support.findByIdAndUpdate(req.params.id, { status: "Resolved" }, { new: true });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
