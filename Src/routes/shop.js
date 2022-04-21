const express = require('express');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/search', shopController.getSearch);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/payment', isAuth, shopController.getPayment);
router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order', isAuth, shopController.postOrder);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);
router.get('/top-products', shopController.getTopProducts);
router.get('/product/recommend', isAuth, shopController.getRecommendProducts);
router.get('/review/:productId', shopController.getReview);
router.post('/review', isAuth, shopController.postReview);
router.post('/reply', isAuth, shopController.postReply);
module.exports = router;
