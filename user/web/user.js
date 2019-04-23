let user = mongoose.Schema({
  email:String,
  username:String,
  password: String
})

let User = mongoose.model("User", user)

module.exports = User