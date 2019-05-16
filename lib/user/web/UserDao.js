const User = require('./user');
const UserSession = require('./UserSession');

const userDao = {
    getUserByEmail: function (email, callback) {
        User.find({ email: email }, callback)
    },

    getAllUser: function (callback) {
        User.find({}, (err, data) => {
            callback(err, data)
        });
    },

    getUserByID: function (id, callback) {
        User.findById(id, (err, data) => {
            callback(err, data)
        });
    },

    addUser: function (user, callback) {
        let n_user = new User({
            email: user.email,
            username: user.username,
            password: user.password
        });
        n_user.save((err) => { callback(err) });
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
            if (err) {
                callback(err);
                return;
            }
            if (!data) {
                callback('no user with id');
                return;
            }
            data.email = user.email;
            data.password = user.password;
            data.name = user.name;
            data.save((err) => { callback(err) });
        });
    },

    createUserSession: function (userId, sessionId, callback) {
        const userSession = new UserSession();
        userSession.userId = userId;
        userSession._id = sessionId;
        userSession.save((err, doc) => {
            callback(err, doc)
        });
    },

    getSessionById: function (id, callback) {
        UserSession.findById(id, (err, data) => {
            callback(err, data);
        });
    },

    deleteSession: function(id, callback) {
        UserSession.findByIdAndDelete(id, callback);
    }
}

module.exports = userDao;