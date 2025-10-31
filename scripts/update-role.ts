import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRole() {
  const email = process.argv[2];
  const role = process.argv[3] as 'ADMIN' | 'TEACHER' | 'VIEWER';

  if (!email || !role) {
    console.error('❌ Uso: npx tsx scripts/update-role.ts <email> <ADMIN|TEACHER|VIEWER>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log('✅ Role atualizada com sucesso:', {
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateRole();
