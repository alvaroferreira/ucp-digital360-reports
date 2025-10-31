import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Uso: npx tsx scripts/update-password.ts <email> <new-password>');
    process.exit(1);
  }

  try {
    // Verificar se utilizador existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Utilizador com email ${email} não encontrado`);
      process.exit(1);
    }

    // Hash da nova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Password atualizada com sucesso para:', email);
  } catch (error) {
    console.error('❌ Erro ao atualizar password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
