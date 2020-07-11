const path = require('path');
const express = require('express');
const picController = require('../controllers/pics');
const router = express.Router();
const { upload } = require("../libs/multer");

router.get('/', picController.renderIndex); 

//para que llegue el archivo y no solo datos se pasa por multer antes de controller
router.post('/upload', upload,picController.uploadFile); 

router.get('/files', picController.getFiles); 

module.exports = router;