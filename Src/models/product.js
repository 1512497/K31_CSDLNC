const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: true },
    brand: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    discount: { type: String, default: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: { type: Number, required: true, default: 0 },
    review: { type: Array },
});

//module.exports = mongoose.model('Product', productSchema);

const mysql2mongo = require('../lib/mysql2mongo');
module.exports = mysql2mongo.model('Product', productSchema);
