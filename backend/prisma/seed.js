const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a Block
  const blockA = await prisma.block.upsert({
    where: { name: 'Block A' },
    update: {},
    create: {
      name: 'Block A',
      floorCount: 10,
    },
  });
  console.log('✅ Block A created');

  // 2. Create Flats
  const flatAdmin = await prisma.flat.upsert({
    where: { blockId_flatNumber: { blockId: blockA.id, flatNumber: 'A-101' } },
    update: {},
    create: {
      blockId: blockA.id,
      flatNumber: 'A-101',
      type: '3BHK',
      squareFeet: 1500,
    },
  });

  const flatResident = await prisma.flat.upsert({
    where: { blockId_flatNumber: { blockId: blockA.id, flatNumber: 'A-102' } },
    update: {},
    create: {
      blockId: blockA.id,
      flatNumber: 'A-102',
      type: '2BHK',
      squareFeet: 1000,
    },
  });
  console.log('✅ Flats created');

  // 3. Create Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@society.com' },
    update: {},
    create: {
      email: 'admin@society.com',
      passwordHash,
      phone: '9999999999',
      role: 'admin',
      status: 'active',
      residentProfile: {
        create: {
          flatId: flatAdmin.id,
          fullName: 'System Administrator',
          moveInDate: new Date(),
          isOwner: true,
        },
      },
    },
  });
  console.log('✅ Admin user created (admin@society.com / Admin@123)');

  // 4. Create Demo Resident User
  const residentHash = await bcrypt.hash('Resident@123', 12);
  
  const residentUser = await prisma.user.upsert({
    where: { email: 'resident@society.com' },
    update: {},
    create: {
      email: 'resident@society.com',
      passwordHash: residentHash,
      phone: '8888888888',
      role: 'resident',
      status: 'active',
      residentProfile: {
        create: {
          flatId: flatResident.id,
          fullName: 'John Doe',
          moveInDate: new Date(),
          isOwner: false,
        },
      },
    },
  });
  console.log('✅ Resident user created (resident@society.com / Resident@123)');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
