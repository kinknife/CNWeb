const User = require('./user');

const userDao = {
    getUserByEmail: function(email,callback){
        User.find({email:email},callback)
    },
    getAllUser: function (callback) {
        User.find({}, (err, data) => {
            callback(err, data)
        });
    },
    getUserByID: function (id, callback) {
        User.findById({ email: id }, (err, data) => {
            callback(err, data)
        });
    },

    addUser: function (user, callback) {
        let n_user = new User({
            email: user.email,
            username: user.username,
            password: user.password
        });
        n_user.save((err) => { console.log(err);callback(err) });
    },

    checkUsername: function (email, callback) {
        User.find({ email: email }, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    },

    updateUser: function (user, callback) {
        let id = user.id;
        User.findById(id, (err, data) => {
            data.email = user.email;
            data.password = user.password;
            data.save((err) => { callback(err) });
        });
    }
}

module.exports = userDao;