const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    studentID: {
        type: String,
        required: true,
        unique: true // Assuming student IDs are unique
    },
    coursesEnrolled: {
        type: [String],
        required: true
    }
}, { collection: 'students' });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;