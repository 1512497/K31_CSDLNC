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

const tableName = "product";
const product = {};

product._mysql2Mongo = require('../lib/mysql2mongo');

product.convModel = function(rows) {
	var result = rows;
	var n = rows.length;
	for (var i = 0; i < n; ++i) {
		var row = rows[i];
		row.review = [];
	}
	return result;
};

product.find = function(search = null) {
	var result = this._mysql2Mongo.model(tableName, this.convModel, null, search);
	if (search != null) {
		result = result.skip(null).limit(null);
	}
	return result;
};

product.findById = async function(id) {
	var r = this._mysql2Mongo.model(tableName, this.convModel, id, null);
	var rows = await r.skip(0).limit(1);
	var result = rows[0];
	return result;
};

module.exports = product;
