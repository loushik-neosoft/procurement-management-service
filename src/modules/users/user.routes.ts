import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '@middlewares/auth';
import { Role } from '@prisma/client';
import validatePayload from '@middlewares/validator';
import { assignPM, createUserSchema } from './user.schema';

const router = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user (Admin or PM only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, PROCUREMENT_MANAGER, INSPECTION_MANAGER, CLIENT]
 *               name:
 *                 type: string
 *             example:
 *               email: "pm@example.com"
 *               password: "password123"
 *               role: "PROCUREMENT_MANAGER"
 *               name: "Procurement Manager"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post(
    '/register',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
    validatePayload(createUserSchema),
    UserController.register
);

/**
 * @swagger
 * /users/assign-pm:
 *   put:
 *     summary: Assign or remove a Procurement Manager for a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               assignedPMId:
 *                 type: string
 *                 format: uuid
 *                 description: PM ID to assign. Pass empty string or omit to remove assignment.
 *     responses:
 *       200:
 *         description: PM assignment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
    '/assign-pm',
    authenticate,
    authorize(Role.ADMIN),
    validatePayload(assignPM),
    UserController.assignPM
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Fetch users with role-based visibility
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleType
 *         schema:
 *           type: string
 *           enum: [ADMIN, PROCUREMENT_MANAGER, INSPECTION_MANAGER, CLIENT]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    '/',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
    UserController.getUsers
);

export default router;
