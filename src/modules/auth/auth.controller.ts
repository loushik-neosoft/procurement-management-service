import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserService } from '@modules/users/user.service';
import { generateToken } from '@utils/jwt';
import { AppError } from 'middlewares/errorHandler';
import { AuthRequest } from '@middlewares/auth';

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, phone, password } = req.body;
            const identifier = email || phone;

            if (!identifier) {
                throw new AppError('Email or mobile number is required', 400);
            }

            const user = await UserService.findByIdentifier(identifier);
            if (!user) {
                throw new AppError('Invalid credentials', 401);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid credentials', 401);
            }

            const token = generateToken({ userId: user.id, role: user.role });

            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        name: user.name,
                    },
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;
            const { userId } = req.user!;

            const user = await UserService.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid old password', 400);
            }

            await UserService.updatePassword(userId, newPassword);

            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
