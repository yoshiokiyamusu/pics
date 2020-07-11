const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageSchema  = new Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  costo: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Image', imageSchema );