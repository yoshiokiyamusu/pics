const express = require('express');
const authController = require('../controllers/auth');
const User = require('../models/user'); //para validar inputs
const { check } = require('express-validator/check');
const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', 
[
  check('email')
    .isEmail()
    .withMessage('Ingrese un mail valido')
    .custom((value,{req}) => {
      if (value === 'test@mail.com') { 
        throw new Error('The email test@mail.com  if forbidden!'); 
      } 
      return true;
    })
    .custom((value,{req}) => {
      return User.findOne({email:value }).then(userDoc =>{
        if(userDoc){
          return Promise.reject('Email exists already');
        }
      });//end return User query
    })//End custom validation
    .normalizeEmail(),

  check('password_login','Please enter a valid password')
  .isLength({min:5})
  //.isAlphanumeric()
  //.trim(),
  /*
  check('confirmPassword').custom((value,{req}) => {
      if (value !== req.body.password) { 
        throw new Error('Password have to match!!'); 
      } 
      return true;
  })
  .trim()  */
],
authController.postSignup);

router.post('/logout', authController.postLogout);




module.exports = router;