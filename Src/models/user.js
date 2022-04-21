const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: { type: Schema.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

// use function so that 'this' points to correct model
userSchema.methods.addToCart = function (product) {
    const cartItems = [...this.cart.items];
    const index = this.cart.items.findIndex(
        (item) => item.productId.toString() === product._id.toString()
    );

    index >= 0
        ? (cartItems[index].quantity = this.cart.items[index].quantity + 1)
        : cartItems.push({ productId: product._id, quantity: 1 });

    this.cart.items = cartItems;
    return this.save();
};

userSchema.methods.removeFromCart = function (id) {
    const cartItems = [...this.cart.items].filter((i) => i.productId.toString() !== id.toString());
    this.cart.items = cartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
