const mongoose = require('mongoose');

const VolunteerSkillSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    skillName: { type: String, required: true, trim: true },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    yearsExperience: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VolunteerSkillSchema.index({ volunteerId: 1, skillName: 1 }, { unique: true });
VolunteerSkillSchema.index({ skillName: 1, proficiency: 1 });

module.exports = mongoose.model('VolunteerSkill', VolunteerSkillSchema);