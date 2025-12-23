import prisma from '@config/database';
import bcrypt from 'bcrypt';
import { User, Role, Prisma } from '@prisma/client';
import { AppError } from '@middlewares/errorHandler';
import { CreateUserSchema } from './user.schema';

export class UserService {
    static async createUser(data: CreateUserSchema, creatorId: string, assignedPMId?: string): Promise<User> {
        const { email, phone, password, role, name } = data;

        // Check if user already exists
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) throw new AppError('User with this email already exists', 400);
        }
        if (phone) {
            const existingUser = await prisma.user.findUnique({ where: { phone } });
            if (existingUser) throw new AppError('User with this phone already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                role,
                name,
                createdById: creatorId,
                assignedPMId,
            },
        });
    }

    static async findByIdentifier(identifier: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                ],
            },
        });
    }

    static async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    static async assignPM(userId: string, assignedPMId: string | undefined): Promise<User> {

        return prisma.user.update({
            where: { id: userId },
            data: {
                assignedPMId: assignedPMId,
            },
        });
    }

    static async getUsers(requestingUser: { userId: string, role: Role }, roleType?: Role): Promise<User[]> {
        let where: Prisma.UserWhereInput = {};



        if (requestingUser.role === Role.PROCUREMENT_MANAGER) {
            where = {
                AND: [
                    { role: roleType || undefined },
                    {
                        OR: [
                            { role: Role.CLIENT },
                            { role: Role.INSPECTION_MANAGER, assignedPMId: requestingUser.userId },
                        ],
                    },
                ],
            };
        } else if (roleType) {
            where.role = roleType;
        }

        return prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    static async updatePassword(userId: string, newPassword: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
}
