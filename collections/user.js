var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    companyId: String,
    username: String,
    password: String,
    name: String,
    role: String // super/admin/user
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
