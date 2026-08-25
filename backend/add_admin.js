const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const hash = await bcrypt.hash('12345678', 10);
    const user = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { passwordHash: hash, role: 'ADMIN', isEmailVerified: true },
      create: {
        fullName: 'System Admin',
        email: 'admin@gmail.com',
        passwordHash: hash,
        role: 'ADMIN',
        isEmailVerified: true
      }
    });
    console.log('Admin user created/updated successfully: ' + user.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
