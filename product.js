const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    STT: Number,
    'NHÓM HÀNG': String,
    'TÊN HÀNG': String,
    ĐVT: String,
    BBCL: Number,
    BBPT: Number,
    BLVIP: Number,
    BL: Number
});

module.exports = mongoose.model('Product', productSchema);