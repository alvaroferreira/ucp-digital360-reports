import { prisma } from '../lib/prisma';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    console.log('📊 Users in database:');
    console.table(users);

    // Check specifically for Alvaro
    const alvaro = await prisma.user.findUnique({
      where: { email: 'alvarocostaferreira@gmail.com' },
    });

    if (alvaro) {
      console.log('\n✅ Alvaro found:', alvaro);
    } else {
      console.log('\n❌ Alvaro not found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
