const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get ALL products with Pagination and Category filtering
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = {};
        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter).skip(skip).limit(limit);
        
        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new product (Admin)
router.post('/add', async (req, res) => {
    try {
        // Simple auto-increment ID
        const count = await Product.countDocuments();
        const product = new Product({
            id: count + 1,
            name: req.body.name,
            price: req.body.price,
            unit: req.body.unit || "1 unit",
            category: req.body.category,
            emoji: req.body.emoji || "📦",
            isAvailable: true
        });
        const newProduct = await product.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Delete a product (Admin)
router.delete('/delete/:id', async (req, res) => {
    try {
        await Product.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Toggle availability (Admin)
router.post('/toggle/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        if(product) {
            product.isAvailable = !product.isAvailable;
            await product.save();
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: "Not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Insert dummy data if empty
router.post('/init', async (req, res) => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const dummy = [
                { id: 1, name: "Fresh Apple", price: 120, unit: "1 kg", category: "Fruits", emoji: "🍎" },
                { id: 2, name: "Banana", price: 50, unit: "1 Dozen", category: "Fruits", emoji: "🍌" },
                { id: 3, name: "Tomato", price: 40, unit: "1 kg", category: "Vegetables", emoji: "🍅" },
                { id: 4, name: "Onion", price: 35, unit: "1 kg", category: "Vegetables", emoji: "🧅" },
                { id: 5, name: "Milk", price: 65, unit: "1 L", category: "Dairy", emoji: "🥛" },
                { id: 6, name: "Brown Bread", price: 50, unit: "1 Pack", category: "Snacks", emoji: "🍞" }
            ];
            await Product.insertMany(dummy);
            res.json({ success: true, message: "Initialized" });
        } else {
            res.json({ success: true, message: "Already initialized" });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.delete('/clean/old', async (req, res) => {
    try {
        const result = await Product.deleteMany({ $or: [{category: null}, {category: ""}, {category: "All"}] });
        res.json({ message: "Cleaned", result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
