import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] as 'ADMIN' | 'TEACHER' | 'VIEWER' || 'VIEWER';
  const name = process.argv[5];

  if (!email || !password) {
    console.error('❌ Uso: npx tsx scripts/create-user.ts <email> <password> [role] [name]');
    console.error('   role: ADMIN, TEACHER ou VIEWER (default: VIEWER)');
    process.exit(1);
  }

  try {
    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar utilizador
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name,
        active: true,
      },
    });

    console.log('✅ Utilizador criado com sucesso:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Nome: ${user.name || 'N/A'}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      console.error('❌ Erro: Já existe um utilizador com este email');
    } else {
      console.error('❌ Erro ao criar utilizador:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
