const { validationResult } = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../util/file');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('neo4j://localhost', neo4j.auth.basic('neo4j', 'admin'));

const postAllProductToN4J = async () => {
    const productMongo = await Product.find({});
    productMongo.forEach(async (product) => {
        const session = driver.session({
            database: 'tiki',
            defaultAccessMode: neo4j.session.WRITE,
        });
        await session.run(
            'MERGE(c:Products {productID:$productID,userID:$userID,name:$titleParam, rating:$ratingParam, price:$priceParam, discount:$discountParam, description: $descriptionParam,brand:$brandParam}) MERGE(b:Brands {name:$brandParam}) MERGE (c)-[:PRODUCED_BY]->(b)',
            {
                productID: String(product._id),
                userID: String(product.userId),
                titleParam: product.title,
                ratingParam: product.rating,
                priceParam: product.price,
                discountParam: product.discount,
                descriptionParam: product.description,
                brandParam: product.brand,
            }
        );
        session.close();
    });
};

const syncBrand = async () => {
    const session = driver.session({
        database: 'tiki',
        defaultAccessMode: neo4j.session.WRITE,
    });
    await session.run(
        'MATCH (n:Brands) WITH n.name AS name, COLLECT(n) AS nodelist, COUNT(*) AS count WHERE count > 1 CALL apoc.refactor.mergeNodes(nodelist) YIELD node RETURN node'
    );
    session.close();
};

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = async (req, res, next) => {
    const { title, brand, color, price, discount, rating, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty() || !image) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: { title, price, rating, description },
            hasError: true,
            errorMessage: !errors.isEmpty()
                ? 'Please enter ' +
                  errors
                      .array()
                      .map((e) => e.msg)
                      .join(', ') +
                  '.'
                : 'Image is not attached or not in the right format.',
            validationErrors: !errors.isEmpty() ? errors.array() : [],
        });
    }
    const product = new Product({
        title,
        brand,
        color,
        price,
        discount,
        imageUrl: image.path.replace('\\', '/'),
        rating,
        description,
        userId: req.user,
    });

    try {
        let session = driver.session({
            database: 'tiki',
            defaultAccessMode: neo4j.session.WRITE,
        });
        const p4j = await session.run('MATCH (n:Products) RETURN n');
        session.close();

        if (p4j.records.length == 0) {
            await postAllProductToN4J();
        }

        await product.save(async (err, newProduct) => {
            const data = {
                productID: String(newProduct._id),
                userID: String(newProduct.userId),
                titleParam: newProduct.title,
                ratingParam: newProduct.rating,
                priceParam: newProduct.price,
                discountParam: newProduct.discount,
                descriptionParam: newProduct.description,
                brandParam: newProduct.brand,
            };
            const session = driver.session({
                database: 'tiki',
                defaultAccessMode: neo4j.session.WRITE,
            });
            await session.run(
                'MERGE(c:Products {productID:$productID,userID:$userID,name:$titleParam, rating:$ratingParam, price:$priceParam, discount:$discountParam, description: $descriptionParam,brand:$brandParam}) MERGE(b:Brands {name:$brandParam}) MERGE (c)-[:PRODUCED_BY]->(b)',
                data
            );
            session.close();
        });
        await syncBrand();
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); // next with error parameter will ignore all other middlewares and return error handling middle ware
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;
    if (!editMode) {
        return res.redirect('/');
    }
    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.render('404');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const { productId, title, brand, color, price, discount, rating, description } = req.body;
    const editedImage = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: productId,
                title,
                brand,
                color,
                price,
                discount,
                rating,
                description,
            },
            hasError: true,
            errorMessage:
                'Please enter ' +
                errors
                    .array()
                    .map((e) => e.msg)
                    .join(', ') +
                '.',
            validationErrors: errors.array(),
        });
    }
    try {
        if ((await Product.findById(productId)).userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        if (editedImage) {
            fileHelper.deleteFile(product.imageUrl);
        }
        const product = await Product.findById(productId);
        await Product.updateOne(product, {
            title,
            brand,
            color,
            price,
            discount,
            imageUrl: editedImage ? editedImage.path.replace('\\', '/') : product.imageUrl,
            rating,
            description,
        });
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ userId: req.user._id });
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        if (!product) {
            return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);
        await Product.deleteOne({ _id: prodId, userId: req.user._id });
        res.status(200).json({ message: 'Succeeded.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed.' });
    }
};
