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
  organization: 'Organization',
  organizationMember: 'OrganizationMember',
  organizationReview: 'OrganizationReview',
  volunteer: 'Volunteer',
  volunteerEvaluation: 'VolunteerEvaluation',
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
