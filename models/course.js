const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: String,
    courseName: String,
    startDate: Date,
    duration: String,
    price: Number,
    details: String,
});

module.exports = mongoose.model('Course', courseSchema);
