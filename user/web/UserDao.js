import User from './user'

export function getAllUser(callback) {
    User.find({}, callback(err, data))
}

export function getUserByID(id, callback) {
    User.findById(id, callback(err, data))
}

export function addUser(user, callback) {
    let n_user = new User({
        email: user.email,
        username: user.username,
        password: user.password
    })
    n_user.save(callback(err))
}

export function checkUsername(userName, callback) {
    User.find({ username: userName }, (err, data) => {
        if (err) {
            callback(err)
        } else {
            if (!data) {
                callback(true)
            } else
                callback(false)
        }
    })
}

export function updateUser(user,callback){
    let id = user.id
    User.findById(id,(err,data)=>{
        data.email = user.email
        data.password = user.password
        data.save(callback(err))
    })
}