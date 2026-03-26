const { PrismaClient, UserRole, DonationStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    await prisma.eventFavorite.deleteMany();
    await prisma.eventRegistration.deleteMany();
    await prisma.eventComment.deleteMany();
    await prisma.eventReport.deleteMany();
    await prisma.organizationReview.deleteMany();
    await prisma.event.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.eventCategory.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.appUser.deleteMany();

    const admin = await prisma.appUser.create({
        data: {
            email: 'admin@volunteerhub.local',
            passwordHash: 'Password123!',
            fullName: 'Admin User',
            phone: '0900000011',
            role: UserRole.Admin,
            isActive: true,
        },
    });

    const organizer = await prisma.appUser.create({
        data: {
            email: 'organizer@volunteerhub.local',
            passwordHash: 'Password123!',
            fullName: 'Organizer User',
            phone: '0900000012',
            role: UserRole.Organizer,
            isActive: true,
        },
    });

    const volunteerUser = await prisma.appUser.create({
        data: {
            email: 'volunteer@volunteerhub.local',
            passwordHash: 'Password123!',
            fullName: 'Volunteer User',
            phone: '0900000013',
            role: UserRole.Volunteer,
            isActive: true,
        },
    });

    const volunteer = await prisma.volunteer.create({
        data: {
            userId: volunteerUser.id,
            fullName: volunteerUser.fullName,
            phone: volunteerUser.phone,
        },
    });

    const education = await prisma.eventCategory.create({ data: { name: 'Education' } });
    const environment = await prisma.eventCategory.create({ data: { name: 'Environment' } });
    await prisma.eventCategory.create({ data: { name: 'Community' } });

    const organization = await prisma.organization.create({
        data: {
            name: 'Green Future Org',
            description: 'Community organization focused on local clean-up campaigns.',
            city: 'Ho Chi Minh City',
            district: 'District 1',
            address: '12 Nguyen Hue',
            contactEmail: 'hello@greenfuture.org',
            phoneNumber: '0900000001',
            website: 'https://greenfuture.org',
            organizationType: 'Non-profit',
            memberCount: 24,
            eventsOrganized: 8,
            averageRating: 4.5,
            totalReviews: 2,
            verified: true,
            ownerUserId: organizer.id,
        },
    });

    const approvedEvent = await prisma.event.create({
        data: {
            title: 'River Clean-up Weekend',
            description: 'Join us to clean and sort waste around the city riverbank.',
            startTime: new Date(Date.now() + 5 * 24 * 3600 * 1000),
            endTime: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 3 * 3600 * 1000),
            location: 'Thu Duc, HCMC',
            organizationId: organization.id,
            categoryId: environment.id,
            maxVolunteers: 50,
            status: 'approved',
        },
    });

    await prisma.event.create({
        data: {
            title: 'Children Reading Workshop',
            description: 'Support reading activities for children at the local shelter.',
            startTime: new Date(Date.now() + 8 * 24 * 3600 * 1000),
            endTime: new Date(Date.now() + 8 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
            location: 'District 3, HCMC',
            organizationId: organization.id,
            categoryId: education.id,
            maxVolunteers: 30,
            status: 'pending',
        },
    });

    await prisma.eventRegistration.create({
        data: {
            eventId: approvedEvent.id,
            volunteerId: volunteer.id,
            fullName: volunteer.fullName,
            phone: volunteer.phone,
            status: 'Pending',
        },
    });

    await prisma.donation.create({
        data: {
            donorName: 'Sample Donor',
            amount: 100,
            phoneNumber: '0900000099',
            message: 'Seed donation',
            transactionCode: 'VH_SEED_1',
            paymentMethod: 'momo',
            status: DonationStatus.Pending,
        },
    });

    console.log('Sample MongoDB Prisma seed completed.');
    console.log({ adminId: admin.id, organizerId: organizer.id, volunteerUserId: volunteerUser.id });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
