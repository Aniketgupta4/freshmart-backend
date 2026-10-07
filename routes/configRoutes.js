const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Get Delivery Charge
router.get('/delivery', async (req, res) => {
    try {
        let config = await Config.findOne({ key: 'deliveryCharge' });
        if (!config) {
            config = await Config.create({ key: 'deliveryCharge', value: '0' });
        }
        res.json({ success: true, charge: parseInt(config.value) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Delivery Charge
router.post('/delivery', async (req, res) => {
    try {
        const { charge } = req.body;
        const config = await Config.findOneAndUpdate(
            { key: 'deliveryCharge' },
            { value: charge.toString() },
            { new: true, upsert: true }
        );
        res.json({ success: true, charge: parseInt(config.value) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
