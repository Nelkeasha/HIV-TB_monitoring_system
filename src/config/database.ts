import 'dotenv/config';
import { PrismaClient } from '.prisma/client/default';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};