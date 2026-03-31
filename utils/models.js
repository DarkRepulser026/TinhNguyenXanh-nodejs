const { mongoose } = require('./mongo-connection');

const modelNames = {
  appUser: 'AppUser',
  donation: 'Donation',
  event: 'Event',
  eventCategory: 'EventCategory',
  eventComment: 'EventComment',
  eventFavorite: 'EventFavorite',
  eventRating: 'EventRating',
  eventRegistration: 'EventRegistration',
  eventReport: 'EventReport',
  eventTask: 'EventTask',
  eventTaskAssignment: 'EventTaskAssignment',
  notification: 'Notification',
  organization: 'Organization',
  organizationMember: 'OrganizationMember',
  organizationReview: 'OrganizationReview',
  volunteer: 'Volunteer',
  volunteerSkill: 'VolunteerSkill',
};

const models = {};

for (const entityName of Object.keys(modelNames)) {
  Object.defineProperty(models, entityName, {
    enumerable: true,
    get() {
      const schemaModelName = modelNames[entityName];
      const model = mongoose.models[schemaModelName];

      if (!model) {
        throw new Error('Mongoose model not registered: ' + schemaModelName);
      }

      return model;
    },
  });
}

module.exports = models;
