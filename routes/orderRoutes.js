const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place an order
router.post('/place', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, message: "Order Placed", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get user's orders
router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ email: req.params.email }).sort({ _id: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders (For Admin)
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ _id: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status (Admin)
router.post('/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findOneAndUpdate({ orderId }, { status }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
