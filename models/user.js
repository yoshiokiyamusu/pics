const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  
  usuario_login: {
    type: String,
    required: true
  },
  password_login: {
    type: String,
    required: true
  },
  usuario_wms: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  celular: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }

});

module.exports = mongoose.model('User', userSchema);