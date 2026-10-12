const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Place an order
router.post('/place', async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (user && user.isBlocked) {
                const now = new Date();
                if (user.blockedUntil && now >= new Date(user.blockedUntil)) {
                    // Temporary block has expired -> auto unblock
                    user.isBlocked = false;
                    user.blockedUntil = null;
                    user.blockReason = '';
                    await user.save();
                } else {
                    const blockMsg = user.blockedUntil
                        ? `Aapka account suspended/blocked hai till ${new Date(user.blockedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Reason: ${user.blockReason || 'Order policy violation'}`
                        : `Aapka account administration dwara permanently suspended hai. Reason: ${user.blockReason || 'Order policy violation'}`;
                    return res.status(403).json({
                        success: false,
                        isBlocked: true,
                        blockedUntil: user.blockedUntil,
                        message: blockMsg
                    });
                }
            }
        }

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
        const { orderId, status, estimatedDeliveryTime } = req.body;
        // Mock generation of a bill PDF URL when status becomes Delivered
        let updateData = { status };
        if (status === 'Delivered') {
            updateData.billUrl = `https://freshmart.com/bills/${orderId}.pdf`;
        }
        if (estimatedDeliveryTime !== undefined && estimatedDeliveryTime !== null) {
            updateData.estimatedDeliveryTime = estimatedDeliveryTime;
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

// Mark Bill as Viewed
router.post('/view-bill', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findOneAndUpdate({ orderId }, { hasViewedBill: true }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

