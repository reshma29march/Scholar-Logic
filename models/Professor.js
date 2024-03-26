const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    assignedCourses: {
        type: [String],
        required: true
    }
}, { collection: 'professors' });

const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;
