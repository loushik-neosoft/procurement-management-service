import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { Pool } from 'pg';

config();
config({ path: '.env.local' });

console.log(process.env.DATABASE_URL);

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }))
});

async function main() {
    const adminEmail = 'admin@procurement.com';
    const adminPassword = 'Neosoft@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            role: Role.ADMIN,
            name: 'Super Admin',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
