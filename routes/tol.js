const path = require('path');
const express = require('express');
const tolController = require('../controllers/tol');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/', tolController.getIndice); //isAuth,
router.get('/os_en_curso', tolController.getOs_en_curso); //isAuth, Detalle de las OT en curso dento del proveedor (actual user)
router.get('/os_en_curso/:os', tolController.getOs_en_cursoDetalle); //isAuth, Detalle de los sku dentro de la OT
router.post('/comment_proveedor/:os', tolController.postComentarioOS); //isAuth,
router.post('/delete_comment_proveedor/:os/:userComment/:comentario', tolController.postDeleteComentarioOS); //isAuth,
module.exports = router;