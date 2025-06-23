const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
    console.log('Connected to MongoDB');
    
    const products = [
        {
            STT: 1,
            NHOMHANG: 'Lốp xe',
            TENHANG: 'Lốp xe máy 100/80-14',
            DVT: 'Cái',
            prices: { BBCL: 450000, BBPT: 420000, BLVIP: 400000, BL: 430000 }
        },
        {
            STT: 2,
            NHOMHANG: 'Phụ kiện cao su',
            TENHANG: 'Gioăng cao su 50mm',
            DVT: 'Cái',
            prices: { BBCL: 15000, BBPT: 14000, BLVIP: 12000, BL: 13000 }
        },
        {
            STT: 3,
            NHOMHANG: 'Băng tải',
            TENHANG: 'Băng tải cao su 500mm',
            DVT: 'Mét',
            prices: { BBCL: 200000, BBPT: 190000, BLVIP: 180000, BL: 195000 }
        }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Sample data inserted');
    mongoose.connection.close();
})
.catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
});