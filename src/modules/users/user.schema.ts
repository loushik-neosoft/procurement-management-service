import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
    email: z.email().optional(),
    phone: z.string().min(10).optional(),
    name: z.string().min(2),
    password: z.string().min(6),
    role: z.enum(Role),
}).superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
        ctx.addIssue({
            code: "custom",
            message: "Either email or phone must be provided",
            path: ["email", "phone"]
        })
    }
    if (data.role === Role.INSPECTION_MANAGER && !data.phone) {
        ctx.addIssue({
            code: "custom",
            message: "Phone number is required for Inspection Manager",
            path: ["phone"]
        })
    }
    if (data.role !== Role.INSPECTION_MANAGER && !data.email) {
        ctx.addIssue({
            code: "custom",
            message: "Email is required for creating User",
            path: ["email"]
        })
    }
})

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const loginSchema = z.object({
    email: z.email().optional(),
    phone: z.string().optional(),
    password: z.string(),
}).refine(data => data.email || data.phone, {
    message: "Either email or phone must be provided",
    path: ["email", "phone"]
})

export type LoginSchema = z.infer<typeof loginSchema>;

export const assignPM = z.object({
    userId: z.uuid(),
    assignedPMId: z.union([z.uuid(), z.literal('')]).optional(),
})

export type AssignPM = z.infer<typeof assignPM>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6),
});
