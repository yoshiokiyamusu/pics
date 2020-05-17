const Product = require('../models/product');
const Order = require('../models/order');
const fetch = require("node-fetch");
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  
  console.log(localStorage.getItem('token')); 
  console.log(localStorage.getItem('expiryDate'));

  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
        //isAuthenticated: req.session.isLoggedIn,
        //csrfToken: req.csrfToken()
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};





//Todas las ordenes de produccion del api
exports.getOPs = (req, res, next) => {
  const token = localStorage.getItem('token');
  const proveedor = 'JANINA';

  fetch('http://localhost:3006/info/orden_servicio/' + proveedor, {
    headers: { Authorization: 'Bearer ' + token }  
  })
  .then(rows => {
    //return JSON.parse(rows);
    return rows.json();
  }).then(data => {
    
    res.render('shop/parse_p', {
      prods: data,
      pageTitle: 'All Products',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn
    });
   // console.log(data);
   // console.log(data[0].fecha_envio.trim() );
   // console.log( data[0].fecha_envio.slice(0, 10) )    
  })
  .catch(err => {
    console.log(err);
  });
  
};


//Todas las ordenes de produccion del api
exports.getOPsBySupplier = (req, res, next) => {
  const token = localStorage.getItem('token');
  const proveedor = req.body.ProveedorId;    console.log(proveedor);
  

  fetch('http://localhost:3006/info/orden_servicio/' + proveedor, {
    headers: { Authorization: 'Bearer ' + token }  
  })
  .then(rows => {
    //return JSON.parse(rows);
    return rows.json();
  }).then(data => {
    
    res.render('shop/parse_p', {
      prods: data,
      pageTitle: 'All Products',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn
    });
 
  })
  .catch(err => {
    console.log(err);
  });
  
};


//Renderizar formulario de comment-taller input
exports.getCommentForm = (req, res, next) => {
  res.render('shop/comentario_form', {
    
    pageTitle: 'Taller comentario',
    path: '/cart',
    api_res: '',
    isAuthenticated: req.session.isLoggedIn
  });

  
};

//Renderizar formulario de comment-taller input
exports.postCommentForm = (req, res, next) => {
  const token = localStorage.getItem('token');
  
  const ot_nombre = req.body.ot; 
  const op_comentario = req.body.op_comentario; 
  const op_usuario = req.body.op_usuario; 

  //console.log(ot_nombre); console.log(op_comentario); console.log(op_usuario);

  fetch('http://localhost:3006/write/comment', {
    method:'POST',
    body:JSON.stringify({
      orden: ot_nombre,
      comentario: op_comentario,
      usuario: op_usuario
    }),
    headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token }
  })
  .then( rows => {
    return rows.json();
  })
  .then(resData => {
    //console.log(resData.message_post);console.log(resData.userId);
    
    res.render('shop/comentario_form', {
      pageTitle: 'Taller comentario',
      path: '/cart',
      api_res: resData,
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err => {
    console.log(err);
  });
};