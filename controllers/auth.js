
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const fetch = require("node-fetch");
const { validationResult } = require('express-validator/check');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


exports.getLogin = (req, res, next) => {
  //para que no pinte req.flash como array vacio
  let message = req.flash('error');
  if(message.length > 0){ message = message[0]; }else{ message = null; } 
  
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message
  }); 
};

exports.getSignup = (req, res, next) => {
    //para que no pinte req.flash como array vacio
    let message = req.flash('error');
    if(message.length > 0){ message = message[0]; }else{ message = null; } 

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput:{email:'', password:'', confirmPassword:''},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  //const email = req.body.email;
  const user_wms = req.body.user_wms
  const password = req.body.password;
  User.findOne({ usuario_wms: user_wms })
    .then(user => {
      if (!user) {
        req.flash('error','Nombre de usuario ingresado no existe');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password_login)
        .then(doMatch => {  
          if (doMatch) {
              /*Fetch post hacia mysql-backend-api para que regreses un jwtoken y se almacene en el localstorage del navegador */ 
              fetch('https://api-trial-post12.herokuapp.com/auth/login',{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  user_wms: user_wms,
                  password: password
                })
              })
              .then(resp => {
                return resp.json();
              })
              .then(resData => { //Set token en el navegador
                console.log(resData.token);
               
                localStorage.setItem('token', resData.token);
                
                const remainingMilliseconds = 60 * 60 * 1000;
                const expiryDate = new Date(
                  new Date().getTime() + remainingMilliseconds
                );
                localStorage.setItem('expiryDate', expiryDate.toISOString());
                localStorage.setAutoLogout(remainingMilliseconds);

              })
              .catch(err => {
                console.log(err);
              }); 
              //Crear la session en el navegador y redireccionar a el contenido del frontend
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/tol');
              });
          }//end:if (doMatch)
          req.flash('error','contraseña ingresada erronea');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {

  const usuario = req.body.usuario_login;
  const password = req.body.password_login;
  const usuario_wms = req.body.usuario_wms;
  const email = req.body.email;
  const celular = req.body.celular;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      //oldInput:{email:email, password:password, confirmPassword:confirmPassword},
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            usuario_login: usuario,
            password_login: hashedPassword,
            usuario_wms: usuario_wms,
            email: email,
            celular: celular,
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
            
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    //Remove token and token expiry date
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    
    console.log(err);
    res.redirect('/login');
  });
};


