const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const op_avanceSchema = new Schema({
  
  id: {
    type: String,
    required: true
  },
  op: {
    type: String,
    required: true
  },
  fecha_entrega: {
    type: Date,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  cantidad_solicitada: {
    type: Number,
    required: true
  },
  cantidad_producida: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model('Op_avance', op_avanceSchema);