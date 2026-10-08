with open('routes/orderRoutes.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_status = """// Update order status (Admin)
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
});"""

new_status = """// Update order status (Admin)
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
});"""

text = text.replace(old_status, new_status)
with open('routes/orderRoutes.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated orderRoutes.js!")
