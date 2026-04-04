const mongoose = require('mongoose');

const VolunteerEvaluationSchema = new mongoose.Schema(
    {
        registrationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EventRegistration',
            required: true,
            unique: true,
        },
        volunteerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Volunteer',
            required: true,
        },
        organizerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AppUser',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('VolunteerEvaluation', VolunteerEvaluationSchema);