const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');//para mostrar mensajes en view, que se guardan de manera temporal en la session

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://yoshio:yoshiopassword@cluster0-luueb.mongodb.net/shop?retryWrites=true&w=majority';
const app = express();

// Settings
app.set('port', process.env.PORT || 3334);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();//token para sessions

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);//token para sessions
app.use(flash());//mensajes guardados en la session temporal

//para la session de users
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//token csurf
//For every request (web level) that is executed, 2 fields will be added to every rendered view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
.connect(MONGODB_URI)
.then(result => {
  // Starting the server
  app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
  });
})
.catch(err => {
  console.log(err);
});
