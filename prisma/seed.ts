import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create or update admin user
  const adminEmail = 'alvarocostaferreira@gmail.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      active: true,
    },
    create: {
      email: adminEmail,
      name: 'Alvaro Costa Ferreira',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log(`✅ Admin user created/updated: ${admin.email} (${admin.role})`);

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
