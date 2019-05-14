const mongoose = require('mongoose');

const UserSession = new mongoose.Schema({
    _id: {
      type: String
    },
    userId:{
      type: String,
      default:''
    },
    timestamp:{
      type: Date,
      default:Date.now()
    },
  });

module.exports = mongoose.model('UserSession', UserSession);