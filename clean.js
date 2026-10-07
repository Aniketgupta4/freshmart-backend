const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const res = await Product.deleteMany({ category: { $in: [null, "", "All"] } });
    console.log('Deleted old products:', res);
    process.exit(0);
});
