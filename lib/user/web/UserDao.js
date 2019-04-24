const User = require('./user');

const userDao = {
    getAllUser: function(callback) {
        User.find({}, (err, data) => {callback(err, data)});
    },
    getUserByID: function(id, callback) {
        User.findById(id, (err, data) => {callback(err, data)});
    },
    
    addUser: function(user, callback) {
        let n_user = new User({
            email: user.email,
            username: user.username,
            password: user.password
        });
        n_user.save((err) => {callback(err)});
    },
    
    checkUsername: function(userName, callback) {
        User.find({ username: userName }, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                if (!data) {
                    callback(null, true);
                } else
                    callback(null, false);
            }
        });
    },
    
    updateUser: function(user,callback){
        let id = user.id;
        User.findById(id,(err,data)=>{
            data.email = user.email;
            data.password = user.password;
            data.save((err) => {callback(err)});
        });
    }
}

module.exports = userDao;