import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
async function main() {
  const d = await prisma.trail.deleteMany({ where: { status: 'seed' } });
  console.log('Deleted', d.count, 'old seed trails');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());