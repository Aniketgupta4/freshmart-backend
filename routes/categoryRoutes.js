const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new category (Admin)
router.post('/', async (req, res) => {
    try {
        const newCat = new Category(req.body);
        const savedCat = await newCat.save();
        res.json(savedCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a category (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
