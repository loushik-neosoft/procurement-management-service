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
 *     description: Creates a new user in the system. Requires different fields based on the role being created (e.g., Phone for Inspection Manager).
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
 *                 description: User's email address. Required for all roles except INSPECTION_MANAGER.
 *               phone:
 *                 type: string
 *                 description: User's phone number. Required for INSPECTION_MANAGER.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the new user account.
 *               role:
 *                 type: string
 *                 enum: [ADMIN, PROCUREMENT_MANAGER, INSPECTION_MANAGER, CLIENT]
 *                 description: Role assigned to the new user. Defines permissions and required fields.
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *             example:
 *               email: "pm@example.com"
 *               password: "password123"
 *               role: "PROCUREMENT_MANAGER"
 *               name: "Procurement Manager"
 *     responses:
 *       201:
 *         description: User created successfully.
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
 *                   description: The created user object.
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier of the created user.
 *                     email:
 *                       type: string
 *                       description: Email of the created user.
 *                     role:
 *                       type: string
 *                       description: Role of the created user.
 *       400:
 *         description: Validation error (e.g., missing required fields, invalid format).
 *       403:
 *         description: Forbidden. User does not have permission to create users.
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
 *     description: Assigns a Procurement Manager to a specific user or removes an existing assignment.
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
 *                 description: The unique identifier (UUID) of the user to be updated.
 *               assignedPMId:
 *                 type: string
 *                 format: uuid
 *                 description: The unique identifier (UUID) of the Procurement Manager to assign. Pass an empty string or omit to remove the current assignment.
 *     responses:
 *       200:
 *         description: Procurement Manager assignment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                   description: The status of the response.
 *                 message:
 *                   type: string
 *                   example: Procurement Manager assigned successfully
 *                   description: A message indicating the result of the operation.
 *       400:
 *         description: Validation error (e.g., invalid UUID format).
 *       401:
 *         description: Unauthorized. Token missing or invalid.
 *       403:
 *         description: Forbidden. Only Admins can perform this action.
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
 *     description: Retrieves a list of users. output depends on the requester's role and the optional filter.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleType
 *         schema:
 *           type: string
 *           enum: [ADMIN, PROCUREMENT_MANAGER, INSPECTION_MANAGER, CLIENT]
 *         description: Optional filter to retrieve users of a specific role.
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
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
 *                   type: array
 *                   description: List of user objects.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID.
 *                       name:
 *                         type: string
 *                         description: User Name.
 *                       email:
 *                         type: string
 *                         description: User Email.
 *                       role:
 *                         type: string
 *                         description: User Role.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    '/',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
    UserController.getUsers
);

export default router;
