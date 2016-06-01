var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    name: String,
    role: String
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
