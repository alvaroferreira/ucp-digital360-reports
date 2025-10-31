import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'admin@ucp.pt';
  const password = 'Admin2024!';

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error('❌ Utilizador não encontrado');
      process.exit(1);
    }

    console.log('✅ Utilizador encontrado:', {
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      hasPassword: !!user.password,
    });

    if (!user.password) {
      console.error('❌ Utilizador não tem password definida');
      process.exit(1);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ Password está correta!');
    } else {
      console.log('❌ Password está incorreta');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
