const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@educhain.com';
  const password = 'password123';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: email,
      passwordHash: passwordHash,
      role: 'ADMIN',
      isEmailVerified: true
    }
  });
  
  console.log(`Created admin - Email: ${admin.email} | Password: ${password}`);
}

createAdmin().catch(console.error).finally(() => prisma.$disconnect());
