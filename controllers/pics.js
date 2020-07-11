const { validationResult } = require('express-validator/check');
const fs = require("fs");
const path = require("path");
const { upload, s3 } = require("../libs/multer");
const Image  = require('../models/pics');


// Render the default Index Page
exports.renderIndex = (req, res, next) => {
  res.render('pics/index', {
    prods: '',
    pageTitle: 'Upload an Image',
    path: '/'    
  });
};

// Upload File Router Handler
exports.uploadFile = async (req, res, next) => {
   // show the uploaded file information
   //console.log(req.file);
    
   for (var i=0; i<req.files.length; i++) {
      // Saving the Image URL in Database
      const newImage = new Image();
      newImage.url = req.files[i].location;
      newImage.title = req.body.nombre_pic;
      newImage.costo = 456;
      newImage.description = 'cualquier ejemplo de imagen';
      await newImage.save();
   }
   // Redirect to the initial page
   res.redirect("/files");

};



// Render the default Index Page
exports.getFiles = async (req, res, next) => {
    
    try {
      //Select from
      const images = await Image.find();
      console.log(images);
  
      res.render("pics/files", {
        prods: '',
        pageTitle: 'getting stored files',
        path: '/',
        images : images
      });

    } catch (error) {
      console.log(error);
    }
  

};


/*

const fs = require("fs");
const path = require("path");
const { upload, s3 } = require("../lib/multer");

const Image = require("../models/Image");

const { BUCKET_NAME } = process.env;

// Render the default Index Page
const renderIndex = (req, res) => {
  res.render("upload", {
    title: "Upload an Image",
  });
};

// Upload File Router Handler
const uploadFile = async (req, res) => {
  // show the uploaded file information
  console.log(req.file);

  // Saving the Image URL in Database
  const newImage = new Image();
  newImage.url = req.file.location;
  await newImage.save();

  // Redirect to the initial page
  res.redirect("/files");
};

// Get all files
const getFiles = async (req, res) => {
  try {
    const images = await Image.find();
    console.log(images);

    res.render("files", {
      images,
      title: "Getting Files",
    });
  } catch (error) {
    console.log(error);
  }
};

const getSingleFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // fetching objects from bucket
    const data = await s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: filename,
      })
      .promise();

    console.log(data);
    const file = fs.createWriteStream(
      path.resolve(`./src/public/files/${filename}`)
    );
    file.write(data.Body);
    res.redirect("/files/" + filename);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  renderIndex,
  uploadFile,
  getFiles,
  getSingleFile,
};


*/  