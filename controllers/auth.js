const User = require('../models/user');
const bcrypt = require('bcryptjs');
const fetch = require("node-fetch");
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
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error','mail ingresado no existe');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
              /*Fetch post hacia mysql-backend-api para que regreses un jwtoken y se almacene en el localstorage del navegador */ 
              fetch('https://api-trial-post12.herokuapp.com/auth/login',{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: email,
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
                this.setAutoLogout(remainingMilliseconds);
                
               
                
                
              })
              .catch(err => {
                console.log(err);
              }); 
              //Crear la session en el navegador y redireccionar a el contenido del frontend
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
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
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
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
