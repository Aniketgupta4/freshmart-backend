const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    email: { type: String, required: true }, // To link with user
    phone: { type: String, default: '' },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    date: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    rating: { type: Number, default: 0 },
    hasViewedBill: { type: Boolean, default: false },
    billUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Order', orderSchema);


