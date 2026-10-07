const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET active coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new coupon (Admin)
router.post('/', async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        const savedCoupon = await newCoupon.save();
        res.json(savedCoupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET verify coupon code
router.get('/verify/:code', async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
        if (!coupon) return res.status(404).json({ error: "Invalid or expired coupon" });
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE coupon (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
