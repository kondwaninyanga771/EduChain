const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  
  if (admins.length === 0) {
      console.log('No admins found.');
  } else {
      admins.forEach(a => console.log(`Email: ${a.email} | Name: ${a.fullName}`));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
