const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    program_code: {
        type: String,
        required: true
    },
    program_name: {
        type: String,
        required: true
    }
}, { collection: 'programs' });

const program = mongoose.model('program', programSchema);

module.exports = program;
