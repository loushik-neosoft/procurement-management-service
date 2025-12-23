import { Router } from 'express';
import { AuthController } from './auth.controller';
import validatePayload from '@middlewares/validator';
import { authenticate } from '@middlewares/auth';
import { changePasswordSchema, loginSchema } from '@modules/users/user.schema';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user using either email or phone and password. One of identifier (email or phone) is required.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address. Required if phone is not provided.
 *               phone:
 *                 type: string
 *                 description: User's registered phone number. Required if email is not provided.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password for authentication.
 *             example:
 *               email: "admin@example.com"
 *               password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                   description: The status of the response.
 *                 data:
 *                   type: object
 *                   description: Payload containing user details and access token.
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: The authenticated user's profile information.
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Unique identifier of the user (UUID).
 *                         email:
 *                           type: string
 *                           description: User's email address.
 *                         phone:
 *                           type: string
 *                           description: User's phone number.
 *                         role:
 *                           type: string
 *                           description: User's role in the system (e.g., ADMIN, PROCUREMENT_MANAGER).
 *                         name:
 *                           type: string
 *                           description: Full name of the user.
 *                     token:
 *                       type: string
 *                       description: JWT access token for subsequent authenticated requests.
 *       400:
 *         description: Validation error or missing credentials (email/phone).
 *       401:
 *         description: Invalid credentials (password mismatch or user not found).
 */
router.post('/login', validatePayload(loginSchema), AuthController.login);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     description: Allows an authenticated user to change their password by providing the old password and a new password.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Current password of the user.
 *               newPassword:
 *                 type: string
 *                 description: New password to be set. Must meet password strength requirements.
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  status:
 *                    type: string
 *                    example: success
 *                    description: The status of the response.
 *                  message:
 *                    type: string
 *                    example: Password changed successfully
 *                    description: A message indicating the result of the operation.
 *       400:
 *         description: Invalid old password or validation error.
 *       401:
 *         description: Unauthorized (Token missing or invalid).
 *       404:
 *         description: User not found.
 */
router.post(
    '/change-password',
    authenticate,
    validatePayload(changePasswordSchema),
    AuthController.changePassword
);

export default router;
