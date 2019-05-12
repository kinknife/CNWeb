const mongoose = require('mongoose');
mongoose.connect('mongodb://cnweb:a150798@ds145786.mlab.com:45786/cnweb', { useNewUrlParser: true });

let user = mongoose.Schema({
  email:String,
  name:String,
  password: String,
});

let User = mongoose.model("User", user);

module.exports = User;