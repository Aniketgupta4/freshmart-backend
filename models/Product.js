const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    emoji: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 100 }
});

module.exports = mongoose.model('Product', productSchema);
