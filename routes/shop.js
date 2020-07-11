const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/prueba', shopController.getIndex); //isAuth,
router.get('/products', shopController.getOPs);//get info proveedor
router.post('/products', shopController.getOPsBySupplier);//get info proveedor seleccionado
//router.get('/products', shopController.getProducts);

//Comentario taller  comment_proveedor
router.get('/comment_proveedor', shopController.getCommentForm);
router.post('/comment_proveedor', shopController.postCommentForm);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/create-order', shopController.postOrder);

router.get('/orders', shopController.getOrders);


//Trial para hacer fifo
router.get('/fifo', shopController.getop_trial); //isAuth,



module.exports = router;
