const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "Pending" }, // Pending, Resolved
    reply: { type: String, default: null }, // Admin Reply
    date: { type: String, required: true }
});

module.exports = mongoose.model('Support', SupportSchema);
