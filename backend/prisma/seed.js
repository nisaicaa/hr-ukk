const dotenv = require('dotenv');
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const username = 'admin';
  const rawPassword = 'humanest26';

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.users.create({
    data: {
      email,
      username,
      password: hashed,
      role: UserRole.ADMIN,
    },
  });

  console.log('Created admin user:', { id_user: user.id_user, email: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
