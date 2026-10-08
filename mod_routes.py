with open('routes/productRoutes.js', 'r', encoding='utf-8') as f:
    text = f.read()

update_route = """
// Update product price (Admin)
router.put('/update/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        if(product) {
            product.price = req.body.price;
            await product.save();
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: "Not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
"""

text = text.replace('// Insert dummy data if empty', update_route + '\n// Insert dummy data if empty')

with open('routes/productRoutes.js', 'w', encoding='utf-8') as f:
    f.write(text)
    
print("Added update route!")
