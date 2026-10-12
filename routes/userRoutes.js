const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// 1. Get All Users with Comprehensive Order & Cancellation Analytics (Admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ _id: -1 });
        const orders = await Order.find();

        const now = new Date();
        const userAnalytics = [];

        for (const user of users) {
            // Check if temporary block has expired
            if (user.isBlocked && user.blockedUntil && now >= new Date(user.blockedUntil)) {
                user.isBlocked = false;
                user.blockedUntil = null;
                user.blockReason = '';
                await user.save();
            }

            // Orders matching this user
            const userOrders = orders.filter(o => 
                (o.email && o.email.toLowerCase() === user.email.toLowerCase())
            );

            const totalOrders = userOrders.length;
            const deliveredOrders = userOrders.filter(o => o.status === 'Delivered').length;
            const cancelledOrders = userOrders.filter(o => o.status === 'Cancelled' || o.status === 'Rejected').length;
            const pendingOrders = userOrders.filter(o => o.status === 'Pending').length;
            const acceptedOrders = userOrders.filter(o => o.status && o.status.startsWith('Accepted')).length;

            const totalSpent = userOrders
                .filter(o => o.status === 'Delivered' || (o.status && o.status.startsWith('Accepted')))
                .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

            const cancelRate = totalOrders > 0 
                ? Math.round((cancelledOrders / totalOrders) * 100) 
                : 0;

            let remainingHours = null;
            let remainingDays = null;
            if (user.isBlocked && user.blockedUntil) {
                const diffMs = new Date(user.blockedUntil) - now;
                if (diffMs > 0) {
                    remainingHours = Math.ceil(diffMs / (1000 * 60 * 60));
                    remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                }
            }

            userAnalytics.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || 'N/A',
                address: user.address || '',
                createdAt: user.createdAt || user._id.getTimestamp(),
                isBlocked: !!user.isBlocked,
                blockedUntil: user.blockedUntil,
                blockReason: user.blockReason || '',
                blockedAt: user.blockedAt,
                remainingDays,
                remainingHours,
                totalOrders,
                deliveredOrders,
                cancelledOrders,
                pendingOrders,
                acceptedOrders,
                totalSpent,
                cancelRate
            });
        }

        res.json({
            success: true,
            totalUsers: users.length,
            blockedUsersCount: userAnalytics.filter(u => u.isBlocked).length,
            users: userAnalytics
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Block / Suspend a User (Admin)
router.post('/block', async (req, res) => {
    try {
        const { email, days, reason } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const daysNum = parseInt(days);
        let blockedUntil = null;
        if (!isNaN(daysNum) && daysNum > 0) {
            blockedUntil = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000);
        }

        user.isBlocked = true;
        user.blockedUntil = blockedUntil;
        user.blockReason = (reason && reason.trim()) || 'Frequent order cancellations / return policy violations';
        user.blockedAt = new Date();

        await user.save();

        res.json({
            success: true,
            message: `User ${user.email} suspended successfully`,
            user: {
                email: user.email,
                isBlocked: user.isBlocked,
                blockedUntil: user.blockedUntil,
                blockReason: user.blockReason
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Unblock a User (Admin)
router.post('/unblock', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBlocked = false;
        user.blockedUntil = null;
        user.blockReason = '';
        user.blockedAt = null;

        await user.save();

        res.json({
            success: true,
            message: `User ${user.email} unblocked successfully`,
            user: {
                email: user.email,
                isBlocked: false
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Check Block Status for Specific User
router.get('/status/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const now = new Date();
        if (user.isBlocked && user.blockedUntil && now >= new Date(user.blockedUntil)) {
            user.isBlocked = false;
            user.blockedUntil = null;
            user.blockReason = '';
            await user.save();
        }

        let remainingDays = null;
        if (user.isBlocked && user.blockedUntil) {
            const diffMs = new Date(user.blockedUntil) - now;
            if (diffMs > 0) remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        res.json({
            success: true,
            isBlocked: !!user.isBlocked,
            blockedUntil: user.blockedUntil,
            blockReason: user.blockReason || '',
            remainingDays
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
