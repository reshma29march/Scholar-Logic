// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    type: String
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

module.exports = User;
