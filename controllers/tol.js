//Mandar mail desde Node.js
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
//const Tol = require('../models/tol');
const fetch = require("node-fetch");
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


//Creando la coneccion con API sendGridMailer, To configure transporter
const transporter = nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:'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'
  }
}));



exports.getIndice = (req, res, next) => {
    //res.send('hola indice');
    console.log(localStorage.getItem('token')); 
    console.log(localStorage.getItem('expiryDate'));
  
    res.render('tol/index', {
        pageTitle: 'Detalle orden Tol',
        path: '/'
        //isAuthenticated: req.session.isLoggedIn,
        //csrfToken: req.csrfToken()
    });
};

exports.getOs_en_curso = (req, res, next) => {

    const token = localStorage.getItem('token');
    const proveedor = req.user.usuario_wms;
    
  fetch('http://localhost:3006/info/ordenes_servicio/' + proveedor, {
    headers: { Authorization: 'Bearer ' + token }  
  }).then(rows => {
    return rows.json();
   
  }).then(data => {   //console.log(data);
    res.render('tol/os_en_curso', {
      data: data,
      pageTitle: 'Indice Tol',
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken()
    });
  }).catch(err => {
    console.log(err);
  });


};

exports.getOs_en_cursoDetalle = (req, res, next) => {
    const token = localStorage.getItem('token');
    const proveedor = req.user.usuario_wms;
    const oredenServ = req.params.os;
   
    fetch('http://localhost:3006/info/ordenes_servicio/' + proveedor + '/' + oredenServ, {
        headers: { Authorization: 'Bearer ' + token }  
      }).then(rows => { 
        return rows.json();
      }).then(data => {   
           
        fetch('http://localhost:3006/info/uno_ordenes_servicio/' + proveedor + '/' + oredenServ, {
            headers: { Authorization: 'Bearer ' + token }  
          }).then(rows => { 
            return rows.json();
          }).then(data_os => {   
                fetch('http://localhost:3006/info/os_comentarios/' + oredenServ, {
                  headers: { Authorization: 'Bearer ' + token }  
                }).then(rows => {
                  return rows.json();
                }).then(data_com => {   
                  res.render('tol/os_en_curso_detalle', {
                      data_os: data_os,
                      data: data,
                      data_com: data_com,
                      pageTitle: 'Detalle Tol',
                      isAuthenticated: req.session.isLoggedIn,
                      csrfToken: req.csrfToken()
                    });
                }).catch(err => {
                  console.log(err);
                });
          }).catch(err => {
            console.log(err);
          });
      }).catch(err => {
        console.log(err);
      });
    

};




exports.postComentarioOS = (req, res, next) => {
  const token = localStorage.getItem('token');
  
  const ot_nombre = req.params.os; 
  const op_comentario = req.body.op_comentario; 
  const op_usuario = req.user.usuario_wms;

  console.log(ot_nombre); console.log(op_comentario); console.log(op_usuario);

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
    res.redirect('/tol/os_en_curso/'+ ot_nombre);
    return transporter.sendMail({
      to: 'yoshiokiyamusu@gmail.com',
      from: 'fiorella.magan@cocotfyma.com',
      subject: 'Orden de servicio: '+ ot_nombre ,
      html:'<h4>' + op_comentario + '</h4>'
    });
  })
  .catch(err => {
    console.log(err);
  });

};




exports.postDeleteComentarioOS = (req, res, next) => {
  const token = localStorage.getItem('token');
  
  const ot_nombre = req.params.os;
  const ot_user_comment = req.params.userComment;  
  const ot_comentario = req.params.comentario;  
  var loggedInUser = req.user.usuario_wms;  
  //console.log(ot_nombre); console.log(ot_user_comment); console.log(ot_comentario);

  if(ot_user_comment == loggedInUser){      
      fetch('http://localhost:3006/write/inactivo_comment', {
        method:'POST',
        body:JSON.stringify({
          orden: ot_nombre,
          comentario: ot_comentario,
          usuario: ot_user_comment
        }),
        headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + token }
      })
      .then( rows => {
        return rows.json();
      })
      .then(resData => {
        //console.log(resData.message_post);console.log(resData.userId);
        res.redirect('/tol/os_en_curso/'+ ot_nombre);
        
      })
      .catch(err => {
        console.log(err);
      });
  }else{
    res.redirect('/tol/os_en_curso/'+ ot_nombre);
  }
};  