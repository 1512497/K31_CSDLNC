const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('neo4j://localhost', neo4j.auth.basic('neo4j', 'admin'));
const ITEMS_PER_PAGE = 4;

const postAllOrderToN4J = async () => {
    const orderMongo = await Order.find({});
    orderMongo.forEach(async (order) => {
        order.products.forEach(async (product) => {
            const session = driver.session({
                database: 'tiki',
                defaultAccessMode: neo4j.session.WRITE,
            });
            await session.run(
                'MATCH(n:Products {productID:$productID}) MERGE (p:Person{userID:$userID,email:$emailParam})-[:BUY]->(n)',
                {
                    orderID: String(order._id),
                    productID: String(product.product._id),
                    emailParam: order.user.email,
                    userID: String(order.user.userId),
                    titleParam: product.product.title,
                    priceParam: order.totalPrice,
                    brandParam: product.product.brand,
                }
            );
            session.close();
        });
    });
};

const syncUser = async () => {
    const session = driver.session({
        database: 'tiki',
        defaultAccessMode: neo4j.session.WRITE,
    });
    await session.run(
        'MATCH (n:Person) WITH n.email AS name, COLLECT(n) AS nodelist, COUNT(*) AS count WHERE count > 1 CALL apoc.refactor.mergeNodes(nodelist) YIELD node RETURN node'
    );
    session.close();
};

exports.getProducts = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const totalItems = await Product.find().countDocuments();
        res.render('shop/product-list', {
            prods: await Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE),
            pageTitle: 'Products',
            path: '/products',
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            currentPage: page,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getTopProducts = async (req, res, next) => {
    try {
        const session = driver.session({
            database: 'tiki',
            defaultAccessMode: neo4j.session.WRITE,
        });
        session
            .run('MATCH (n:Products) RETURN n ORDER BY n.Rating DESC LIMIT 5')
            .then(function (result) {
                let productsArr = [];
                result.records.forEach(function (record) {
                    productsArr.push({
                        id: record._fields[0].identity.low,
                        productID: record._fields[0].properties.productID,
                        name: record._fields[0].properties.name,
                        rating: record._fields[0].properties.rating,
                        price: record._fields[0].properties.price,
                        discount: record._fields[0].properties.discount,
                        brand: record._fields[0].properties.brand,
                        description: record._fields[0].properties.description,
                    });
                });
                res.render('shop/top-products', {
                    products: productsArr,
                    pageTitle: 'Top-Products',
                    path: '/top-products',
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getRecommendProducts = async (req, res, next) => {
    try {
        const session = driver.session({
            database: 'tiki',
            defaultAccessMode: neo4j.session.WRITE,
        });
        const orderMongo = await Order.find({});
        const person = await User.findOne({ _id: req.user._id });

        const recommendProducts = await session.run(
            'MATCH (b:Brands)  MATCH (n:Person{email:$emailParam})-[:BUY]->(p:Products)   MATCH (p)-[:PRODUCED_BY]->(b) MATCH (r:Products)-[:PRODUCED_BY]->(b) RETURN r LIMIT 20',
            {
                emailParam: person.email,
            }
        );
        session.close();
        const productArr = recommendProducts.records.map((item) => {
            const product = item._fields[0].properties;
            return product;
        });
        res.render('shop/recommend-products', {
            products: productArr,
            pageTitle: 'Recommend Products',
            path: '/product/recommend',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getReview = async (req, res, next) => {
    try {
        const productID = req.params.productId;
        const product = await Product.findOne({ _id: productID });
        res.status(200).json(product.review);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postReview = async (req, res, next) => {
    try {
        const { productId, content } = req.body;
        const product = await Product.findOne({ _id: productId });
        const user = await User.findOne({ _id: req.user._id });
        const newReviewList = product.review;
        newReviewList.push({
            email: user.email,
            id: req.user._id,
            content: content,
        });
        product.review = newReviewList;
        // await product.save();
        await Product.updateOne({ _id: productId }, { $set: { review: newReviewList } });
        console.log('abc', content);
        res.redirect(`/products/${productId}`);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postReply = async (req, res, next) => {
    try {
        const { productId, reply, index } = req.body;
        const product = await Product.findOne({ _id: productId });
        const user = await User.findOne({ _id: req.user._id });

        const newReviewList = product.review.map((item, i) => {
            if (i == index) {
                if (!item.reply) {
                    item.reply = [];
                }
                item.reply.push({
                    email: user.email,
                    id: req.user._id,
                    content: reply,
                });
            }
            return item;
        });

        await Product.updateOne({ _id: productId }, { $set: { review: newReviewList } });
        res.redirect(`/products/${productId}`);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        let haveBought = false;
        if (req.user && false) {
            const orders = await Order.find({ 'user.userId': req.user._id });
            orders.forEach(({ products }) => {
                if (products.find(({ product }) => product._id.toString() === productId))
                    haveBought = true;
            });
        }
        res.render('shop/product-detail', {
            product,
            pageTitle: product.title,
            path: '/products',
            haveBought,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const totalItems = await Product.find().countDocuments();
        res.render('shop/index', {
            prods: await Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE),
            pageTitle: 'Shop',
            path: '/',
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            currentPage: page,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getSearch = async (req, res, next) => {
    try {
        const query = req.query.query;
        const regex = new RegExp(query, 'i');
        const products = await Product.find(
            { title: { $regex: regex } },
            'title description discount price rating'
        );
        res.render('shop/search', {
            path: '/products',
            pageTitle: 'Search',
            products,
            query,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate(); // execPopulate so that it returns a promise
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: user.cart.items,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCart = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    try {
        await req.user.removeFromCart(req.body.productId);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

const getCartItemPrice = ({ quantity, productId }) =>
    (parseFloat(productId.price) - parseFloat(productId.discount)) * quantity;

const getTotalPriceFromCart = ({ items }) => {
    let totalPrice = 0;
    items.forEach((item) => {
        totalPrice += getCartItemPrice(item);
    });
    return Math.trunc(totalPrice * 100) / 100;
};

exports.getPayment = async (req, res, next) => {
    try {
        const { cart } = await req.user.populate('cart.items.productId').execPopulate();
        const totalPrice = getTotalPriceFromCart(cart);
        res.render('shop/payment', {
            path: '/cart',
            pageTitle: 'Payment',
            products: cart.items,
            totalPrice,
        });
    } catch {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate();
        const products = user.cart.items.map((i) => {
            return { product: { ...i.productId._doc }, quantity: i.quantity }; // spread operator and _doc to make sure we get the full info
        });
        const { receiver, address } = req.body;
        const totalPrice = getTotalPriceFromCart(user.cart);
        const order = new Order({
            user: {
                email: user.email,
                userId: user,
            },
            products,
            receiver,
            address,
            totalPrice,
        });
        await order.save();
        await user.clearCart();
        await postAllOrderToN4J();
        await syncUser();
        return res.redirect('/orders');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error(!order ? 'No order found.' : 'Unauthorized.'));
        }
        const fileName = 'invoice-' + req.params.orderId + '.pdf';
        const filePath = path.join('data', 'invoices', fileName);

        const pdf = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=' + fileName);
        pdf.pipe(fs.createWriteStream(filePath));
        pdf.pipe(res);
        pdf.fontSize(26).text('Invoice', { underline: true });
        pdf.fontSize(14).text('--------------------');
        pdf.fontSize(14).text(`Receiver: ${order.receiver}`);
        pdf.fontSize(14).text(`Delivery address: ${order.address}`);
        pdf.fontSize(14).text('--------------------');
        order.products.forEach(({ product, quantity }) => {
            const itemPrice = product.price - product.discount;
            if (product.discount !== '0') {
                pdf.fontSize(14).text(
                    `${product.title} - ${quantity} x $${itemPrice} (${product.price} - ${product.discount})`
                );
            } else {
                pdf.fontSize(14).text(`${product.title} - ${quantity} x $${itemPrice}`);
            }
        });
        pdf.fontSize(14).text('--------------------');
        pdf.fontSize(20).text('Total price: $' + order.totalPrice);
        pdf.end();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
