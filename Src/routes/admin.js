const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
    '/add-product',
    [
        body('title')
            .isString()
            .withMessage('a title with valid characters')
            .isLength({ min: 3 })
            .withMessage('a title with at least 3 characters')
            .trim(),
        body('price', 'a valid price').isFloat(),
        body('rating', 'a rating between 0 and 5').isFloat({ min: 0, max: 5 }),
        body('description', 'a description with at least 3 characters').isLength({ min: 5 }).trim(),
    ],
    isAuth,
    adminController.postAddProduct
);
router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
    '/edit-product',
    [
        body('title')
            .isString()
            .withMessage('a title with valid characters')
            .isLength({ min: 3 })
            .withMessage('a title with at least 3 characters')
            .trim(),
        body('price', 'a valid price').isFloat(),
        body('description', 'a description with at least 3 characters').isLength({ min: 5 }).trim(),
    ],
    isAuth,
    adminController.postEditProduct
);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
