const path = require('path');
const express = require('express');
const isAuth = require('../middleware/is-auth');
const adminController = require('../controllers/admin');
const { check } = require('express-validator/check');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', [
    check('title')
    .isLength({min:5})
    .withMessage('mas de 5 caracteres')
    .isAlphanumeric()
    .withMessage('solo caracteres!')
    .custom((value,{req}) => {
        if (value === 'libro') { 
        throw new Error('No se puede ingresar libro'); 
        } 
        return true;
    })
],adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
