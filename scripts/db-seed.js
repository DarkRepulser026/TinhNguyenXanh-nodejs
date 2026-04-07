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

  // ==================== CLEANUP SMOKE ARTIFACTS ====================
  console.log('🧹 Cleaning smoke-test artifacts...');

  const smokeUsers = await models.appUser.find({ email: /^smoke\./i }).select('_id').lean();
  const smokeUserIds = smokeUsers.map((user) => user._id);

  if (smokeUserIds.length > 0) {
    const smokeVolunteers = await models.volunteer.find({ userId: { $in: smokeUserIds } }).select('_id').lean();
    const smokeVolunteerIds = smokeVolunteers.map((item) => item._id);

    await models.organizationMember.deleteMany({ userId: { $in: smokeUserIds } });
    await models.eventComment.deleteMany({ userId: { $in: smokeUserIds } });
    await models.eventRating.deleteMany({ userId: { $in: smokeUserIds } });
    await models.organizationReview.deleteMany({ userId: { $in: smokeUserIds } });
    await models.eventReport.deleteMany({ reporterUserId: { $in: smokeUserIds } });
    await models.donation.deleteMany({ userId: { $in: smokeUserIds } });
    await models.appUser.deleteMany({ _id: { $in: smokeUserIds } });

    if (smokeVolunteerIds.length > 0) {
      await models.eventRegistration.deleteMany({ volunteerId: { $in: smokeVolunteerIds } });
      await models.eventFavorite.deleteMany({ volunteerId: { $in: smokeVolunteerIds } });
      await models.volunteerEvaluation.deleteMany({ volunteerId: { $in: smokeVolunteerIds } });
      await models.volunteer.deleteMany({ _id: { $in: smokeVolunteerIds } });
    }
  }

  await models.event.deleteMany({ title: { $in: ['Smoke Event', 'Updated Smoke Event'] } });
  await models.eventCategory.deleteMany({ name: 'Smoke Category' });

  // ==================== USERS ====================
  console.log('📝 Creating users...');

  const adminUsers = [];
  for (let i = 1; i <= 2; i++) {
    const admin = await upsertUser({
      email: `admin${i}@tinhnguyenxanh.local`,
      fullName: `System Admin ${i}`,
      phone: `090000000${i}`,
      role: 'Admin',
      password: 'Admin12345',
    });
    adminUsers.push(admin);
  }

  const organizerUsers = [];
  for (let i = 1; i <= 3; i++) {
    const organizer = await upsertUser({
      email: `organizer${i}@tinhnguyenxanh.local`,
      fullName: `Organizer ${i}`,
      phone: `090000000${i + 2}`,
      role: 'Organizer',
      password: 'Organizer12345',
    });
    organizerUsers.push(organizer);
  }

  const volunteerUsers = [];
  const volunteerNames = [
    'Nguyễn Văn An',
    'Trần Thị Bích Liên',
    'Phạm Công Cường',
  ];

  for (let i = 0; i < volunteerNames.length; i++) {
    const volunteer = await upsertUser({
      email: `volunteer${i + 1}@tinhnguyenxanh.local`,
      fullName: volunteerNames[i],
      phone: `091000000${String(i + 1).padStart(2, '0')}`,
      role: 'Volunteer',
      password: 'Volunteer12345',
    });
    volunteerUsers.push(volunteer);
  }

  // ==================== VOLUNTEERS ====================
  console.log('👥 Creating volunteer profiles...');

  const volunteerProfiles = [];
  for (const user of volunteerUsers) {
    const volunteer = await models.volunteer.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          fullName: user.fullName,
          phone: user.phone,
          hoursCompleted: Math.floor(Math.random() * 100),
          skillsBadges: [],
          bio: `Passionate volunteer committed to making a difference in the community. Love ${['environment', 'education', 'healthcare'][Math.floor(Math.random() * 3)]}.`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
    volunteerProfiles.push(volunteer);
  }

  // ==================== CATEGORIES ====================
  console.log('🏷️  Creating event categories...');

  const categoryNames = ['Environment', 'Education', 'Healthcare', 'Community Support', 'Sports', 'Arts & Culture', 'Tech'];
  const categories = [];

  for (const name of categoryNames) {
    const category = await upsertCategory(name);
    categories.push(category);
  }

  // ==================== ORGANIZATIONS ====================
  console.log('🏢 Creating organizations...');

  const organizationData = [
    {
      owner: organizerUsers[0],
      name: 'Tinh Nguyen Xanh Community',
      description: 'Community volunteers running local environment and education events.',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      address: '12 Nguyen Hue, District 1',
      contactEmail: 'hello@tinhnguyenxanh.local',
      phoneNumber: '02873000001',
      website: 'https://tinhnguyenxanh.local',
      organizationType: 'Non-profit',
      avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=tinhnguyenxanh',
      focusAreas: ['Environment', 'Education', 'Community Support'],
    },
    {
      owner: organizerUsers[1],
      name: 'Education For All',
      description: 'Providing quality education and literacy programs to underserved communities.',
      city: 'Hanoi',
      district: 'Hoan Kiem',
      address: '999 Ba Trieu Street, Hoan Kiem District',
      contactEmail: 'info@educationforall.local',
      phoneNumber: '02438000002',
      website: 'https://educationforall.local',
      organizationType: 'Non-profit',
      avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=education',
      focusAreas: ['Education', 'Community Support'],
    },
    {
      owner: organizerUsers[2],
      name: 'Health & Wellness Foundation',
      description: 'Promoting public health and wellness through community initiatives.',
      city: 'Da Nang',
      district: 'Hai Chau',
      address: '500 Le Duan Street, Da Nang',
      contactEmail: 'contact@healthfoundation.local',
      phoneNumber: '02363000003',
      website: 'https://healthfoundation.local',
      organizationType: 'NGO',
      avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=health',
      focusAreas: ['Healthcare', 'Community Support'],
    },
  ];

  const organizations = [];
  for (const orgData of organizationData) {
    const org = await models.organization.findOneAndUpdate(
      { ownerUserId: orgData.owner._id },
      {
        $set: {
          name: orgData.name,
          description: orgData.description,
          city: orgData.city,
          district: orgData.district,
          address: orgData.address,
          contactEmail: orgData.contactEmail,
          phoneNumber: orgData.phoneNumber,
          website: orgData.website,
          organizationType: orgData.organizationType,
          verified: true,
          avatarUrl: orgData.avatar,
          focusAreas: orgData.focusAreas || [],
          memberCount: 1,
        },
        $setOnInsert: {
          ownerUserId: orgData.owner._id,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
    organizations.push(org);

    // Add organizer as organization member
    await models.organizationMember.findOneAndUpdate(
      { organizationId: org._id, userId: orgData.owner._id },
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
  }

  // ==================== EVENTS ====================
  console.log('📅 Creating events...');

  const getEventImageQuery = (title, category) => {
    const keywordMap = {
      Environment: 'trees,park,clean,river,beach,forest',
      Education: 'books,school,children,learning,teacher',
      Healthcare: 'medical,health,wellness,clinic,doctor',
      'Community Support': 'community,help,volunteer,food,shelter',
      Sports: 'sports,team,fitness,kids',
      'Arts & Culture': 'art,culture,festival,creative',
    };

    const categoryQuery = keywordMap[category] || 'volunteer';
    const titleQuery = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 3)
      .join(',');

    return `${categoryQuery},${titleQuery}`.replace(/\s*,\s*/g, ',');
  };

  const eventTemplates = [
    // Environment
    {
      title: 'Urban Park Clean-up Day',
      description: 'Join us to clean up city park areas and plant more trees. Help create a greener environment for our community.',
      category: 'Environment',
      maxVolunteers: 30,
      baseDay: 3,
    },
    {
      title: 'Tree Planting Initiative',
      description: 'Plant native trees to restore local ecosystems and combat climate change.',
      category: 'Environment',
      maxVolunteers: 40,
      baseDay: 5,
    },
    {
      title: 'River Cleanup Campaign',
      description: 'Help clean our local river and protect aquatic life.',
      category: 'Environment',
      maxVolunteers: 35,
      baseDay: 7,
    },
    {
      title: 'Beach Cleanup & Ocean Conservation',
      description: 'Remove plastic and waste from beaches to protect marine ecosystems.',
      category: 'Environment',
      maxVolunteers: 50,
      baseDay: 10,
    },

    // Education
    {
      title: 'Weekend Reading Class',
      description: 'Support children with reading and basic English activities.',
      category: 'Education',
      maxVolunteers: 20,
      baseDay: 6,
    },
    {
      title: 'STEM Workshop for Kids',
      description: 'Teach science, technology, engineering and math to underprivileged children.',
      category: 'Education',
      maxVolunteers: 25,
      baseDay: 8,
    },
    {
      title: 'English Conversation Club',
      description: 'Practice English with native and non-native speakers in a casual setting.',
      category: 'Education',
      maxVolunteers: 15,
      baseDay: 9,
    },
    {
      title: 'Computer Skills Training',
      description: 'Teach basic computer and internet skills to seniors and digitally disadvantaged.',
      category: 'Education',
      maxVolunteers: 12,
      baseDay: 11,
    },

    // Healthcare
    {
      title: 'Community Health Checkup Camp',
      description: 'Provide free health screenings and basic medical guidance.',
      category: 'Healthcare',
      maxVolunteers: 30,
      baseDay: 4,
    },
    {
      title: 'Mental Health Awareness Workshop',
      description: 'Share knowledge about mental health and wellbeing in the community.',
      category: 'Healthcare',
      maxVolunteers: 20,
      baseDay: 9,
    },
    {
      title: 'First Aid Training Session',
      description: 'Learn life-saving first aid techniques and get certified.',
      category: 'Healthcare',
      maxVolunteers: 18,
      baseDay: 12,
    },

    // Community Support
    {
      title: 'Community Food Distribution',
      description: 'Package and distribute meals to nearby families in need.',
      category: 'Community Support',
      maxVolunteers: 25,
      baseDay: 10,
    },
    {
      title: 'Elderly Care & Companionship',
      description: 'Visit and spend time with elderly people in care homes.',
      category: 'Community Support',
      maxVolunteers: 15,
      baseDay: 8,
    },
    {
      title: 'Homeless Support Initiative',
      description: 'Distribute supplies and care packages to homeless individuals.',
      category: 'Community Support',
      maxVolunteers: 20,
      baseDay: 11,
    },
    {
      title: 'Community Kitchen - Meal Prep',
      description: 'Prepare nutritious meals for community members in need.',
      category: 'Community Support',
      maxVolunteers: 22,
      baseDay: 13,
    },

    // Sports
    {
      title: 'Community Sports Day',
      description: 'Organize sports activities and games for all ages.',
      category: 'Sports',
      maxVolunteers: 35,
      baseDay: 7,
    },
    {
      title: 'Kids Soccer Training Program',
      description: 'Teach children soccer skills and teamwork.',
      category: 'Sports',
      maxVolunteers: 16,
      baseDay: 9,
    },

    // Arts & Culture
    {
      title: 'Community Art Workshop',
      description: 'Create murals and public art installations to beautify neighborhoods.',
      category: 'Arts & Culture',
      maxVolunteers: 24,
      baseDay: 6,
    },
    {
      title: 'Cultural Festival Volunteer',
      description: 'Help organize and manage a local cultural festival.',
      category: 'Arts & Culture',
      maxVolunteers: 40,
      baseDay: 14,
    },
  ];

  const createdEvents = [];
  let eventIndex = 0;

  for (let i = 0; i < 3; i++) {
    const org = organizations[i];

    for (let j = 0; j < 6; j++) {
      if (eventIndex >= eventTemplates.length) break;

      const template = eventTemplates[eventIndex];
      const category = categories.find(c => c.name === template.category);

      const event = await models.event.findOneAndUpdate(
        { title: template.title, organizationId: org._id },
        {
          $set: {
            title: template.title,
            description: template.description,
            location: `${org.city}, ${org.district}`,
            categoryId: category._id,
            startTime: toDate(template.baseDay, 7 + Math.floor(Math.random() * 4), 0),
            endTime: toDate(template.baseDay, 11 + Math.floor(Math.random() * 4), 30),
            status: 'approved',
            maxVolunteers: template.maxVolunteers,
            isHidden: false,
            images: `https://source.unsplash.com/600x400/?${encodeURIComponent(getEventImageQuery(template.title, template.category))}&sig=${eventIndex}`,
            organizationId: org._id,
          },
        },
        { upsert: true, returnDocument: 'after' }
      ).lean();

      createdEvents.push(event);
      eventIndex++;
    }
  }

  // ==================== EVENT REGISTRATIONS ====================
  console.log('✍️  Creating event registrations...');

  const registrationIds = [];

  for (let i = 0; i < createdEvents.length; i++) {
    const event = createdEvents[i];

    // Register 2-5 random volunteers to each event
    const numVolunteers = 2 + Math.floor(Math.random() * 4);
    const selectedVolunteers = new Set();

    while (selectedVolunteers.size < numVolunteers && selectedVolunteers.size < volunteerProfiles.length) {
      selectedVolunteers.add(Math.floor(Math.random() * volunteerProfiles.length));
    }

    for (const volIndex of selectedVolunteers) {
      const volunteer = volunteerProfiles[volIndex];
      const volunteerUser = volunteerUsers[volIndex];
      const statuses = ['Pending', 'Confirmed', 'Rejected', 'Cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const registration = await models.eventRegistration.findOneAndUpdate(
        {
          eventId: event._id,
          volunteerId: volunteer._id,
        },
        {
          $set: {
            fullName: volunteer.fullName,
            phone: volunteer.phone,
            reason: [
              'I want to contribute to local community activities.',
              'This cause is very important to me.',
              'I have relevant skills and want to help.',
              'Looking for meaningful volunteer work.',
              'Want to make a positive impact.',
            ][Math.floor(Math.random() * 5)],
            status: randomStatus,
            registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).lean();

      if (registration && registration._id) {
        registrationIds.push(String(registration._id));
      }
    }
  }

  // ==================== EVENT FAVORITES ====================
  console.log('❤️  Creating event favorites...');

  for (const volunteer of volunteerProfiles) {
    const favoriteCount = Math.min(createdEvents.length, 2 + Math.floor(Math.random() * 3));
    const pickedIndexes = new Set();

    while (pickedIndexes.size < favoriteCount) {
      pickedIndexes.add(Math.floor(Math.random() * createdEvents.length));
    }

    for (const eventIndexValue of pickedIndexes) {
      const event = createdEvents[eventIndexValue];
      await models.eventFavorite.findOneAndUpdate(
        { eventId: event._id, volunteerId: volunteer._id },
        { $set: { createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  // ==================== EVENT RATINGS & REVIEWS ====================
  console.log('⭐ Creating event ratings and reviews...');

  for (let i = 0; i < createdEvents.length; i++) {
    const event = createdEvents[i];

    // Rating from 1-4 random volunteers
    const numRatings = 1 + Math.floor(Math.random() * 4);
    const selectedRaters = new Set();

    while (selectedRaters.size < numRatings && selectedRaters.size < volunteerUsers.length) {
      selectedRaters.add(Math.floor(Math.random() * volunteerUsers.length));
    }

    for (const raterIndex of selectedRaters) {
      const user = volunteerUsers[raterIndex];
      const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars

      const reviews = [
        'Great event! Very well organized.',
        'Amazing experience, learned a lot.',
        'Loved volunteering with this organization.',
        'Made a real impact on the community.',
        'Friendly volunteers and staff.',
        'Would definitely participate again!',
        'Very fulfilling and meaningful work.',
        'Great cause and great people.',
      ];

      await models.eventRating.findOneAndUpdate(
        {
          eventId: event._id,
          userId: user._id,
        },
        {
          $set: {
            rating: rating,
            review: reviews[Math.floor(Math.random() * reviews.length)],
            isHidden: false,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
  }

  // ==================== EVENT COMMENTS ====================
  console.log('💬 Creating event comments...');

  for (let i = 0; i < Math.min(10, createdEvents.length); i++) {
    const event = createdEvents[i];

    // Add 2-4 comments per event
    const numComments = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < numComments; j++) {
      const userIndex = Math.floor(Math.random() * volunteerUsers.length);
      const user = volunteerUsers[userIndex];

      const comments = [
        'What time should I arrive?',
        'Do I need any special equipment?',
        'Is this suitable for beginners?',
        'Can I bring a friend?',
        'How far in advance should I register?',
        'Looking forward to this!',
        'Great initiative!',
        'Will transportation be provided?',
      ];

      await models.eventComment.findOneAndUpdate(
        {
          eventId: event._id,
          userId: user._id,
          content: comments[j % comments.length],
        },
        {
          $set: {
            content: comments[j % comments.length],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true }
      );
    }
  }

  // ==================== ORGANIZATION REVIEWS ====================
  console.log('🏢 Creating organization reviews...');

  for (const org of organizations) {
    // Each organization gets 2-4 reviews
    const numReviews = 2 + Math.floor(Math.random() * 3);
    const selectedReviewers = new Set();

    while (selectedReviewers.size < numReviews && selectedReviewers.size < volunteerUsers.length) {
      selectedReviewers.add(Math.floor(Math.random() * volunteerUsers.length));
    }

    for (const reviewerIndex of selectedReviewers) {
      const user = volunteerUsers[reviewerIndex];
      const rating = 3 + Math.floor(Math.random() * 3);

      const orgReviews = [
        'Excellent organization, highly recommend!',
        'Professional and well-managed events.',
        'Made a real difference in the community.',
        'Very welcoming and supportive team.',
        'Great cause, great execution.',
      ];

      await models.organizationReview.findOneAndUpdate(
        {
          organizationId: org._id,
          userId: user._id,
        },
        {
          $set: {
            rating: rating,
            title: 'Đánh giá tổ chức',
            content: orgReviews[Math.floor(Math.random() * orgReviews.length)],
            status: 'Approved',
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
  }

  // ==================== EVENT REPORTS ====================
  console.log('🚩 Creating event reports...');

  const reportReasons = [
    'Inappropriate content',
    'Potential scam event',
    'Incorrect event information',
    'Unsafe location or activity',
  ];

  for (let i = 0; i < Math.min(6, createdEvents.length); i++) {
    const event = createdEvents[i];
    const reporter = volunteerUsers[i % volunteerUsers.length];
    const reason = reportReasons[i % reportReasons.length];

    await models.eventReport.findOneAndUpdate(
      { eventId: event._id, reporterUserId: reporter._id, reason },
      {
        $set: {
          details: 'Seeded moderation sample report for testing workflows.',
          status: ['Pending', 'Approved', 'Rejected'][i % 3],
          reviewedByUserId: i % 3 === 0 ? null : adminUsers[i % adminUsers.length]._id,
          reviewedAt: i % 3 === 0 ? null : new Date(),
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // ==================== VOLUNTEER EVALUATIONS ====================
  console.log('🧾 Creating volunteer evaluations...');

  const confirmedRegistrations = await models.eventRegistration
    .find({ _id: { $in: registrationIds.map((id) => mongoose.Types.ObjectId.createFromHexString(id)) }, status: 'Confirmed' })
    .populate('eventId')
    .lean();

  for (const registration of confirmedRegistrations.slice(0, 12)) {
    const event = registration.eventId;
    if (!event || !event.organizationId) {
      continue;
    }

    const organization = organizations.find((item) => String(item._id) === String(event.organizationId));
    if (!organization) {
      continue;
    }

    const organizerUser = organizerUsers.find((user) => String(user._id) === String(organization.ownerUserId));
    if (!organizerUser) {
      continue;
    }

    await models.volunteerEvaluation.findOneAndUpdate(
      { registrationId: registration._id },
      {
        $set: {
          volunteerId: registration.volunteerId,
          organizerUserId: organizerUser._id,
          rating: 3 + Math.floor(Math.random() * 3),
          comment: [
            'Reliable volunteer and on time.',
            'Great attitude and teamwork throughout the event.',
            'Completed assigned tasks responsibly.',
            'Communicated clearly and helped other volunteers.',
          ][Math.floor(Math.random() * 4)],
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // ==================== DONATIONS ====================
  console.log('💳 Creating donations...');

  for (let i = 1; i <= 8; i++) {
    const donationUser = volunteerUsers[(i - 1) % volunteerUsers.length];
    await models.donation.findOneAndUpdate(
      { transactionCode: `SEED_DONATION_${i}` },
      {
        $set: {
          userId: donationUser ? donationUser._id : null,
          donorName: `Seed Donor ${i}`,
          amount: 50000 * i,
          phoneNumber: `09800000${String(i).padStart(2, '0')}`,
          message: i % 2 === 0 ? 'Keep up the great community work!' : 'Happy to support this cause.',
          paymentMethod: i % 2 === 0 ? 'momo' : 'bank',
          status: ['Pending', 'Success', 'Failed'][i % 3],
          providerRef: i % 3 === 0 ? null : `PROVIDER_REF_${i}`,
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log('✅ Seed completed!');
  console.log(`📊 Summary:`);
  console.log(`   - ${adminUsers.length + organizerUsers.length + volunteerUsers.length} users created`);
  console.log(`   - ${organizations.length} organizations created`);
  console.log(`   - ${categories.length} categories created`);
  console.log(`   - ${createdEvents.length} events created`);
  console.log(`   - Registrations, favorites, ratings, comments, and reports added`);
  console.log(`   - Volunteer evaluations and donation transactions added`);
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