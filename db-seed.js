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
      // Org 1 – TP. HCM – Quận 1
      owner: organizerUsers[0],
      name: 'Tình Nguyện Xanh Community',
      description:
        'Tình Nguyện Xanh Community là tổ chức phi lợi nhuận hàng đầu tại TP. Hồ Chí Minh chuyên tổ chức các hoạt động tình nguyện về môi trường, giáo dục và cộng đồng. Chúng tôi đã kết nối hơn 5.000 tình nguyện viên và tổ chức hơn 200 sự kiện trên toàn thành phố.',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      address: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'hello@tinhnguyenxanh.vn',
      phoneNumber: '02873001234',
      website: 'https://tinhnguyenxanh.vn',
      organizationType: 'Non-profit',
      taxCode: '0312345678',
      foundedDate: new Date('2018-03-15'),
      legalRepresentative: 'Nguyễn Thành Phát',
      facebookUrl: 'https://facebook.com/tinhnguyenxanh',
      zaloNumber: '0901234567',
      achievements: 'Top 10 tổ chức tình nguyện tiêu biểu TP. HCM 2022 & 2023. Hơn 50.000 giờ tình nguyện tích lũy. Trồng hơn 10.000 cây xanh tại các công viên thành phố.',
      focusAreas: ['Environment', 'Education', 'Community Support'],
      avatarUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=200&fit=crop',
      headerImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop',
      // Google Maps embed – Nguyễn Huệ, Q.1, HCM
      mapEmbed:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4868945064914!2d106.69898!3d10.7762854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d777c13%3A0xa6de51fa7e0975b!2zMTIgTmd1eeG7hW4gSHXhu4csIELhur9uIE5naMOpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712345678901',
    },
    {
      // Org 2 – Hà Nội – Hoàn Kiếm
      owner: organizerUsers[1],
      name: 'Giáo Dục Cho Mọi Người',
      description:
        'Giáo Dục Cho Mọi Người là tổ chức phi lợi nhuận hoạt động tại Hà Nội, tập trung vào việc nâng cao chất lượng giáo dục, xóa mù chữ và kỹ năng số cho các cộng đồng còn thiếu điều kiện. Chúng tôi đã hỗ trợ hơn 3.000 trẻ em và người lớn tiếp cận giáo dục tốt hơn.',
      city: 'Hà Nội',
      district: 'Hoàn Kiếm',
      ward: 'Phường Phan Chu Trinh',
      address: '9 Tràng Thi, Phường Phan Chu Trinh, Quận Hoàn Kiếm, Hà Nội',
      contactEmail: 'info@giaoducchomoinguoi.vn',
      phoneNumber: '02438561234',
      website: 'https://giaoducchomoinguoi.vn',
      organizationType: 'Non-profit',
      taxCode: '0108765432',
      foundedDate: new Date('2015-09-05'),
      legalRepresentative: 'Trần Minh Quang',
      facebookUrl: 'https://facebook.com/giaoducchomoinguoi',
      zaloNumber: '0912345678',
      achievements: 'Giải thưởng Giáo dục cộng đồng xuất sắc 2021 của Bộ GD-ĐT. Hơn 120 lớp học miễn phí tổ chức mỗi năm. Đối tác chiến lược của UNICEF Việt Nam.',
      focusAreas: ['Education', 'Tech', 'Community Support'],
      avatarUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop',
      headerImage: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=1200&h=400&fit=crop',
      // Google Maps embed – Tràng Thi, Hoàn Kiếm, Hà Nội
      mapEmbed:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0966779855746!2d105.8489697!3d21.0267789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab952da484e3%3A0x85fcb0e4f5c6c6a4!2zOSBUcuG6p25nIFRoaSwgUGhhbiBDaHUgVHJpbmgsIEhvYW4gS2llbSwgSGFub2ksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1712345678902',
    },
    {
      // Org 3 – Đà Nẵng – Hải Châu
      owner: organizerUsers[2],
      name: 'Sức Khỏe & Thịnh Vượng Cộng Đồng',
      description:
        'Sức Khỏe & Thịnh Vượng Cộng Đồng là tổ chức NGO hoạt động tại Đà Nẵng, hướng đến nâng cao sức khỏe thể chất và tinh thần cho người dân. Chúng tôi tổ chức các camp khám sức khỏe miễn phí, workshop tâm lý và các chương trình thể thao cộng đồng trên khắp miền Trung.',
      city: 'Đà Nẵng',
      district: 'Hải Châu',
      ward: 'Phường Thạch Thang',
      address: '99 Bạch Đằng, Phường Thạch Thang, Hải Châu, Đà Nẵng',
      contactEmail: 'contact@suckhoecd.vn',
      phoneNumber: '02363501234',
      website: 'https://suckhoecd.vn',
      organizationType: 'NGO',
      taxCode: '0401234567',
      foundedDate: new Date('2019-06-01'),
      legalRepresentative: 'Phạm Thị Bích Vân',
      facebookUrl: 'https://facebook.com/suckhoeconngdong',
      zaloNumber: '0935678901',
      achievements: 'Hơn 15.000 lượt khám sức khỏe miễn phí từ 2019 đến nay. Đối tác của Sở Y tế Đà Nẵng. Tổ chức hơn 80 workshop tâm lý học đường và cộng đồng.',
      focusAreas: ['Healthcare', 'Sports', 'Arts & Culture'],
      avatarUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
      headerImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&h=400&fit=crop',
      // Google Maps embed – Bạch Đằng, Hải Châu, Đà Nẵng
      mapEmbed:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.1234567890123!2d108.2208!3d16.0678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252cc3%3A0x714c416ada6e8c4!2zOTkgQuG6oWNoIMSQw6BuZywgVGjhuqFjaCBUaGFuZywgSMOjaSBDaMOidSwgxJDDoCBO4bq1bmcsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1712345678903',
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
          ward: orgData.ward,
          address: orgData.address,
          contactEmail: orgData.contactEmail,
          phoneNumber: orgData.phoneNumber,
          website: orgData.website,
          organizationType: orgData.organizationType,
          taxCode: orgData.taxCode,
          foundedDate: orgData.foundedDate,
          legalRepresentative: orgData.legalRepresentative,
          facebookUrl: orgData.facebookUrl,
          zaloNumber: orgData.zaloNumber,
          achievements: orgData.achievements,
          focusAreas: orgData.focusAreas,
          verified: true,
          avatarUrl: orgData.avatarUrl,
          headerImage: orgData.headerImage,
          memberCount: Math.floor(Math.random() * 80) + 20,
          eventsOrganized: Math.floor(Math.random() * 50) + 10,
          averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          totalReviews: Math.floor(Math.random() * 30) + 5,
        },
        $setOnInsert: {
          ownerUserId: orgData.owner._id,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();
    // Attach mapEmbed for use in event seeds
    org._mapEmbed = orgData.mapEmbed;
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

  // Each event template now includes:
  //   image  – real Unsplash photo URL (hardcoded, no random)
  //   mapUrl – Google Maps embed src for an actual Vietnam location
  // orgIndex (0‑based) maps the event to organizations[0/1/2]
  const eventTemplates = [
    // ===== ORG 0 – Tình Nguyện Xanh Community (HCM, Q.1) =====
    {
      title: 'Ngày Dọn Dẹp Công Viên Đô Thị',
      description:
        'Cùng chúng tôi dọn sạch các khu công viên trong thành phố và trồng thêm cây xanh. Hãy góp sức tạo nên môi trường sống xanh – sạch – đẹp hơn cho cộng đồng.',
      category: 'Environment',
      maxVolunteers: 30,
      baseDay: 3,
      image: 'https://images.unsplash.com/photo-1532996122724-e3c66192f20e?w=600&h=400&fit=crop',
      // Công viên Tao Đàn, Q.1, HCM
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5!2d106.6918!3d10.7758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3bfb836af5%3A0x3f29e04c4ceabee5!2zQ8O0bmcgVmnDqm4gVGFvIMSQw6BuLCBRdeG6rW4gMSwgVFAuIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1712300001001',
    },
    {
      title: 'Chiến Dịch Trồng Cây Xanh',
      description:
        'Trồng cây bản địa để phục hồi hệ sinh thái địa phương và chống biến đổi khí hậu. Mỗi cây trồng là một hành động thiết thực vì tương lai.',
      category: 'Environment',
      maxVolunteers: 40,
      baseDay: 5,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      // Công viên 23/9, Q.1, HCM
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6962!3d10.7763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d777c13%3A0xa6de51fa7e0975b!2zQ8O0bmcgdmnDqm4gMjMtOSwgUXXhuq1uIDEsIFRQLiBIb-G7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1712300001002',
    },
    {
      title: 'Chiến Dịch Làm Sạch Kênh Nhiêu Lộc',
      description:
        'Tham gia cùng chúng tôi làm sạch kênh Nhiêu Lộc – Thị Nghè, bảo vệ nguồn nước và hệ sinh thái thủy sinh đô thị tại TP. Hồ Chí Minh.',
      category: 'Environment',
      maxVolunteers: 35,
      baseDay: 7,
      image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=600&h=400&fit=crop',
      // Kênh Nhiêu Lộc – Thị Nghè, Q.3, HCM
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2!2d106.6888!3d10.7843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2b8d45b5d3%3A0x4ea5b4e0cdfb2c01!2zS8OqbmggTmhpw6p1IExvYyAtIFRo4buLIE5naGUsIFFu4bqtbiAzLCBUUC4gSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1712300001003',
    },
    {
      title: 'Bảo Vệ Biển & Phong Trào Nhặt Rác Bãi Biển',
      description:
        'Loại bỏ nhựa và rác thải khỏi bãi biển để bảo vệ hệ sinh thái biển. Hành động nhỏ, ý nghĩa lớn cho đại dương và thế hệ tương lai.',
      category: 'Environment',
      maxVolunteers: 50,
      baseDay: 10,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      // Bãi biển Mũi Né (Phan Thiết – gần HCM)
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62691.5!2d108.2!3d10.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3176a8b29e30b7ff%3A0x5e97eaef0ce2b6f5!2zTXXDrSBOw6ksIFBoxqFuIFRoaeG6v3QsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1712300001004',
    },
    {
      title: 'Lớp Đọc Sách Cuối Tuần',
      description:
        'Hỗ trợ trẻ em luyện đọc và các hoạt động tiếng Anh cơ bản. Một buổi chiều ý nghĩa giúp các em tự tin hơn trong học tập.',
      category: 'Education',
      maxVolunteers: 20,
      baseDay: 6,
      image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=400&fit=crop',
      // Thư viện Khoa học Tổng hợp TP. HCM, Q.1
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6!2d106.6963!3d10.7752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3b7d21acb7%3A0x3e0a1a6741f36e18!2zVGjGsOG7h24gVmnhu4duIEtob2EgaOG7jWMgVOG7lW5nIGjhu6NwIFRQLiBIQ00!5e0!3m2!1svi!2s!4v1712300001005',
    },
    {
      title: 'Workshop STEM Cho Trẻ Em',
      description:
        'Dạy khoa học, công nghệ, kỹ thuật và toán học cho trẻ em có hoàn cảnh khó khăn theo phương pháp thực hành sáng tạo và thú vị.',
      category: 'Education',
      maxVolunteers: 25,
      baseDay: 8,
      image: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&h=400&fit=crop',
      // Trung tâm Hoa Sen, Q.1, HCM
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.7!2d106.6994!3d10.7743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3ade040547%3A0x619f4c4ec6b15c83!2zVHJ1bmcgdMOibSBIb2EgU2VuLCBRdeG6rW4gMSwgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1712300001006',
    },

    // ===== ORG 1 – Giáo Dục Cho Mọi Người (Hà Nội, Hoàn Kiếm) =====
    {
      title: 'Câu Lạc Bộ Hội Thoại Tiếng Anh',
      description:
        'Luyện tiếng Anh cùng người bản ngữ và tình nguyện viên quốc tế trong không khí thân thiện, cởi mở. Không cần kinh nghiệm – chỉ cần nhiệt tình!',
      category: 'Education',
      maxVolunteers: 15,
      baseDay: 9,
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop',
      // Không gian sáng tạo Toong, Hoàn Kiếm, Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1!2d105.8519!3d21.0263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab952da484e3%3A0x4e2a0f66a6fcbee4!2sTr%C3%A0ng%20Thi%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1712300002001',
    },
    {
      title: 'Đào Tạo Kỹ Năng Máy Tính Cho Người Cao Tuổi',
      description:
        'Hướng dẫn kỹ năng máy tính và sử dụng internet cơ bản cho người cao tuổi và những người bị thiệt thòi về kỹ thuật số. Kết nối thế hệ, xóa khoảng cách số.',
      category: 'Education',
      maxVolunteers: 12,
      baseDay: 11,
      image: 'https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=600&h=400&fit=crop',
      // Nhà văn hóa Hoàn Kiếm, Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.3!2d105.8523!3d21.0249!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9491e2b935%3A0x78f498a33a49dcd2!2zSG9hbiBLaWVtIERpc3RyaWN0LCBIYW5vaSwgVmlldG5hbQ!5e0!3m2!1svi!2s!4v1712300002002',
    },
    {
      title: 'Cung Cấp Thực Phẩm Cho Cộng Đồng',
      description:
        'Đóng gói và phân phát bữa ăn cho các gia đình khó khăn gần khu vực Hoàn Kiếm. Mỗi phần ăn là một nghĩa cử ấm lòng.',
      category: 'Community Support',
      maxVolunteers: 25,
      baseDay: 10,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
      // Hồ Hoàn Kiếm, Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d105.8514!3d21.0278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9f3dc9c001%3A0xc27b4ce3ff62dcb!2zSOG7kyBIb8OgbiBLaeG6v20sIEhhbm9pLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300002003',
    },
    {
      title: 'Chăm Sóc & Đồng Hành Người Cao Tuổi',
      description:
        'Thăm hỏi và dành thời gian bên các cụ già tại các viện dưỡng lão quanh khu vực Hà Nội. Sự hiện diện của bạn là món quà quý giá nhất.',
      category: 'Community Support',
      maxVolunteers: 15,
      baseDay: 8,
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop',
      // Trung Tâm Dưỡng Lão Thị Nghè (minh họa), Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5!2d105.8416!3d21.0236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab57c88b57d7%3A0xb09c26a3d15b0be4!2zSG9hbiBLaWVtLCBIYW5vaSwgVmlldG5hbQ!5e0!3m2!1svi!2s!4v1712300002004',
    },
    {
      title: 'Hỗ Trợ Người Vô Gia Cư',
      description:
        'Phân phát vật phẩm thiết yếu và túi chăm sóc cho những người vô gia cư tại Hà Nội. Hãy cùng chúng tôi mang lại chút ấm áp cho họ.',
      category: 'Community Support',
      maxVolunteers: 20,
      baseDay: 11,
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
      // Vườn hoa Lý Thái Tổ, Hoàn Kiếm, Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.15!2d105.8511!3d21.0261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9eda24b3b5%3A0xbf03a9bdb0f1ebe5!2zVsaw4budbiBI9r6W4bu3IEjDoCBO4buZaSwgSG9hbiBLaeG6v20sIEhhbm9pLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300002005',
    },
    {
      title: 'Bếp Ăn Cộng Đồng – Cùng Nấu Cùng Chia',
      description:
        'Chuẩn bị những bữa ăn dinh dưỡng cho các thành viên cộng đồng có hoàn cảnh khó khăn. Một bếp lửa nhỏ, một trái tim lớn.',
      category: 'Community Support',
      maxVolunteers: 22,
      baseDay: 13,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
      // Nhà Văn Hóa Thanh Niên Hà Nội
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d105.8492!3d21.0278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9f7a3c9f29%3A0x5a097c3416b4e81a!2zTmjDoCBWxINuIEjDs2EgVGhhbmggTmnDqm4gSOG6oCBO4buZaSwgSGFub2ksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1712300002006',
    },

    // ===== ORG 2 – Sức Khỏe & Thịnh Vượng Cộng Đồng (Đà Nẵng, Hải Châu) =====
    {
      title: 'Trại Khám Sức Khỏe Cộng Đồng Miễn Phí',
      description:
        'Cung cấp kiểm tra sức khỏe miễn phí và tư vấn y tế cơ bản cho người dân khu vực Hải Châu. Chăm sóc sức khỏe là quyền của mọi người.',
      category: 'Healthcare',
      maxVolunteers: 30,
      baseDay: 4,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop',
      // Công viên Biển Đông, Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.7!2d108.2469!3d16.0643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c4f38f4f2f%3A0x1a2b3c4d5e6f7a8b!2zQ8O0bmcgdmnDqm4gQmnhu4NuIMSQw7RuZywgSOG6o2kgQ2jDonUsIMSQw6AgTuG6tW5nLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300003001',
    },
    {
      title: 'Workshop Nhận Thức Về Sức Khỏe Tâm Thần',
      description:
        'Chia sẻ kiến thức về sức khỏe tâm thần và tinh thần với cộng đồng. Cùng phá bỏ định kiến và xây dựng xã hội quan tâm đến sức khỏe nội tâm.',
      category: 'Healthcare',
      maxVolunteers: 20,
      baseDay: 9,
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop',
      // Trung tâm Văn hóa Hải Châu, Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.5!2d108.2208!3d16.0660!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252cc3%3A0xaabbccdd11223344!2zSMG6o2kgQ2jDonUsIMSQw6AgTuG6tW5nLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300003002',
    },
    {
      title: 'Buổi Huấn Luyện Sơ Cấp Cứu',
      description:
        'Học các kỹ thuật sơ cấp cứu cứu sống người và được cấp chứng chỉ. Kiến thức bạn có thể cứu một mạng người vào ngày mai.',
      category: 'Healthcare',
      maxVolunteers: 18,
      baseDay: 12,
      image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop',
      // Bệnh viện C Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.3!2d108.2121!3d16.0680!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142198a2bf93611%3A0x85b2ea08e671f5e3!2zQuG7h25oIHZp4buHbiBDIMSQw6AgTuG6tW5n!5e0!3m2!1svi!2s!4v1712300003003',
    },
    {
      title: 'Ngày Hội Thể Thao Cộng Đồng',
      description:
        'Tổ chức các hoạt động thể thao và trò chơi dành cho mọi lứa tuổi tại bãi biển Đà Nẵng. Vui khoẻ – gắn kết – bền vững!',
      category: 'Sports',
      maxVolunteers: 35,
      baseDay: 7,
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop',
      // Bãi biển Mỹ Khê, Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.9!2d108.2469!3d16.0622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219e2ffa0b535%3A0xaa6c15f5f68f95c0!2zQuG6o2kgYmnhu4NuIE3hu7kgS2jDqiwgxJDDoCBO4bq1bmcsIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1712300003004',
    },
    {
      title: 'Chương Trình Dạy Bóng Đá Cho Trẻ Em',
      description:
        'Dạy kỹ năng bóng đá và tinh thần đồng đội cho trẻ em. Thể thao không chỉ rèn luyện thể chất mà còn hình thành nhân cách.',
      category: 'Sports',
      maxVolunteers: 16,
      baseDay: 9,
      image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop',
      // Sân vận động Hòa Xuân, Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3836.5!2d108.2112!3d16.0570!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421900c00c18df%3A0xf9b283f95e2d6e0a!2zU8OibiB24bqtbiDEkeG7mW5nIEjDsmEgWHXDom4sIMSQw6AgTuG6tW5nLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300003005',
    },
    {
      title: 'Workshop Nghệ Thuật Cộng Đồng',
      description:
        'Tạo tranh tường và các tác phẩm nghệ thuật công cộng để làm đẹp các con phố Đà Nẵng. Nghệ thuật là ngôn ngữ chung của nhân loại.',
      category: 'Arts & Culture',
      maxVolunteers: 24,
      baseDay: 6,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
      // Phố cổ Hội An (gần Đà Nẵng)
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62213.6!2d108.3280!3d15.8801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142105b3ac8e069%3A0xe26c77b55cfd3f86!2zUGjhu5EgY-G7lSBIaeG7mWkgQW4sIFF14bqjbmcgTmFtLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1712300003006',
    },
    {
      title: 'Tình Nguyện Lễ Hội Văn Hóa',
      description:
        'Giúp tổ chức và quản lý lễ hội văn hóa địa phương tại Đà Nẵng. Bảo tồn và phát huy bản sắc văn hóa miền Trung.',
      category: 'Arts & Culture',
      maxVolunteers: 40,
      baseDay: 14,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop',
      // Bảo tàng Chăm, Đà Nẵng
      mapUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.8!2d108.2235!3d16.0634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421973e7af0019%3A0x9b6f62c8c1d1a83!2zQuG6o28gdMOgbmcgxJBp4bqlegogQ2jDoG0sIEjhuqNpIENow6J1LCDEkMOgIE7hurVuZywgVmlldG5hbQ!5e0!3m2!1svi!2s!4v1712300003007',
    },
  ];

  const createdEvents = [];
  let eventIndex = 0;

  // Each org owns exactly the slice of eventTemplates assigned to it (6 each, 7 for last)
  const slices = [
    eventTemplates.slice(0, 6),   // Org 0 – HCM
    eventTemplates.slice(6, 12),  // Org 1 – Hà Nội
    eventTemplates.slice(12),     // Org 2 – Đà Nẵng
  ];

  for (let i = 0; i < 3; i++) {
    const org = organizations[i];
    const templates = slices[i];

    for (const template of templates) {
      const category = categories.find(c => c.name === template.category);

      const event = await models.event.findOneAndUpdate(
        { title: template.title, organizationId: org._id },
        {
          $set: {
            title: template.title,
            description: template.description,
            location: `${org.city}, ${org.district}`,
            mapUrl: template.mapUrl,
            categoryId: category._id,
            startTime: toDate(template.baseDay, 7 + Math.floor(Math.random() * 4), 0),
            endTime: toDate(template.baseDay, 11 + Math.floor(Math.random() * 4), 30),
            status: 'approved',
            maxVolunteers: template.maxVolunteers,
            isHidden: false,
            images: template.image,
            organizationId: org._id,
          },
        },
        { upsert: true, returnDocument: 'after' }
      ).lean();

      createdEvents.push(event);
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
            content: orgReviews[Math.floor(Math.random() * orgReviews.length)],
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
    await models.donation.findOneAndUpdate(
      { transactionCode: `SEED_DONATION_${i}` },
      {
        $set: {
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