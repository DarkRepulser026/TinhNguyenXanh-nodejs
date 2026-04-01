#!/usr/bin/env node

const { connectToDatabase, mongoose } = require('../utils/mongo-connection');
const models = require('../utils/models');

function toDate(daysFromNow, hour, minute) {
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hour, minute, 0, 0);
  return value;
}

async function upsertUser(input) {
  return models.appUser.findOneAndUpdate(
    { email: input.email.toLowerCase() },
    {
      $set: {
        fullName: input.fullName,
        phone: input.phone || null,
        role: input.role,
        isActive: true,
        passwordHash: input.password,
      },
      $setOnInsert: {
        email: input.email.toLowerCase(),
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).lean();
}

async function upsertCategory(name) {
  return models.eventCategory.findOneAndUpdate(
    { name },
    { $set: { name } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).lean();
}

async function runSeed() {
  await connectToDatabase();

  const adminUser = await upsertUser({
    email: 'admin@tinhnguyenxanh.local',
    fullName: 'System Admin',
    phone: '0900000001',
    role: 'Admin',
    password: 'Admin12345',
  });

  const organizerUser = await upsertUser({
    email: 'organizer@tinhnguyenxanh.local',
    fullName: 'Event Organizer',
    phone: '0900000002',
    role: 'Organizer',
    password: 'Organizer12345',
  });

  const volunteerUser = await upsertUser({
    email: 'volunteer@tinhnguyenxanh.local',
    fullName: 'Demo Volunteer',
    phone: '0900000003',
    role: 'Volunteer',
    password: 'Volunteer12345',
  });

  const volunteer = await models.volunteer.findOneAndUpdate(
    { userId: volunteerUser._id },
    {
      $set: {
        userId: volunteerUser._id,
        fullName: volunteerUser.fullName,
        phone: volunteerUser.phone,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).lean();

  const organization = await models.organization.findOneAndUpdate(
    { ownerUserId: organizerUser._id },
    {
      $set: {
        name: 'Tinh Nguyen Xanh Community',
        description: 'Community volunteers running local environment and education events.',
        city: 'Ho Chi Minh City',
        district: 'District 1',
        address: '12 Nguyen Hue, District 1',
        contactEmail: 'hello@tinhnguyenxanh.local',
        phoneNumber: '02873000001',
        website: 'https://tinhnguyenxanh.local',
        organizationType: 'Non-profit',
        verified: true,
      },
      $setOnInsert: {
        ownerUserId: organizerUser._id,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).lean();

  await models.organizationMember.findOneAndUpdate(
    { organizationId: organization._id, userId: organizerUser._id },
    {
      $set: {
        role: 'Owner',
        status: 'Active',
      },
      $setOnInsert: {
        joinedAt: new Date(),
      },
    },
    { upsert: true }
  );

  const categoryNames = ['Environment', 'Education', 'Healthcare', 'Community Support'];
  const categories = [];

  for (const name of categoryNames) {
    const category = await upsertCategory(name);
    categories.push(category);
  }

  const now = new Date();

  const seedEvents = [
    {
      title: 'Urban Park Clean-up Day',
      description: 'Join us to clean up city park areas and plant more trees.',
      location: 'Le Van Tam Park',
      categoryId: categories.find(c => c.name === 'Environment')._id,
      startTime: toDate(3, 7, 30),
      endTime: toDate(3, 11, 30),
      status: 'approved', // ✅ FIX
      maxVolunteers: 30,
      isHidden: false,
    },
    {
      title: 'Weekend Reading Class',
      description: 'Support children with reading and basic English activities.',
      location: 'Thanh Da Community House',
      categoryId: categories.find(c => c.name === 'Education')._id,
      startTime: toDate(6, 8, 0),
      endTime: toDate(6, 11, 0),
      status: 'approved', // ✅ FIX
      maxVolunteers: 20,
      isHidden: false,
    },
    {
      title: 'Community Food Distribution',
      description: 'Package and distribute meals to nearby families in need.',
      location: 'Binh Thanh District Center',
      categoryId: categories.find(c => c.name === 'Community Support')._id,
      startTime: toDate(10, 13, 30),
      endTime: toDate(10, 17, 30),
      status: 'approved', // ✅ FIX
      maxVolunteers: 25,
      isHidden: false,
    },
  ];

  const createdEvents = [];

  for (const eventInput of seedEvents) {
    const event = await models.event.findOneAndUpdate(
      { title: eventInput.title, organizationId: organization._id },
      { $set: { ...eventInput, organizationId: organization._id } },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    createdEvents.push(event);
  }

  await models.eventRegistration.findOneAndUpdate(
    {
      eventId: createdEvents[0]._id,
      volunteerId: volunteer._id,
    },
    {
      $set: {
        fullName: volunteer.fullName,
        phone: volunteer.phone,
        reason: 'I want to contribute to local community activities.',
        status: 'Pending',
        registeredAt: now,
      },
    },
    { upsert: true }
  );

  console.log('✅ Seed completed!');
}

runSeed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
  })
  .finally(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });