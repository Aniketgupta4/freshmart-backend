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

// Get user's orders with Pagination
router.get('/user/:email', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { email: req.params.email };
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter).sort({ _id: -1 }).skip(skip).limit(limit);
        
        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders (For Admin) with Pagination
router.get('/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments();
        const orders = await Order.find().sort({ _id: -1 }).skip(skip).limit(limit);
        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status (Admin)
router.post('/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        // Mock generation of a bill PDF URL when status becomes Delivered
        let updateData = { status };
        if (status === 'Delivered') {
            updateData.billUrl = `https://freshmart.com/bills/${orderId}.pdf`;
        }
        const order = await Order.findOneAndUpdate({ orderId }, updateData, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Rate an order
router.post('/rate', async (req, res) => {
    try {
        const { orderId, rating } = req.body;
        const order = await Order.findOneAndUpdate({ orderId }, { rating }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
