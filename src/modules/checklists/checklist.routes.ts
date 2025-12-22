import { Router } from 'express';
import { ChecklistController } from './checklist.controller';
import { authenticate, authorize } from '@middlewares/auth';
import { Role } from '@prisma/client';
import validatePayload from '@middlewares/validator';
import { createChecklistTemplateSchema, updateChecklistTemplateSchema } from './checklist.schema';

const router = Router();

/**
 * @swagger
 * /checklists:
 *   post:
 *     summary: Create a checklist template (Admin/PM only)
 *     description: Creates a new checklist template. If an active template with the same name and client exists, it will be deactivated.
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, questions]
 *             properties:
 *               name:
 *                 type: string
 *               clientId:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [DEFAULT, CLIENT]
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [key, label, type, orderIndex]
 *                   properties:
 *                     key:
 *                       type: string
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [BOOLEAN, DROPDOWN, MULTI_SELECT, TEXT, IMAGE_UPLOAD]
 *                     required:
 *                       type: boolean
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     orderIndex:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
    '/',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
    validatePayload(createChecklistTemplateSchema),
    ChecklistController.createTemplate
);

/**
 * @swagger
 * /checklists:
 *   get:
 *     summary: List all active templates
 *     description: Fetches all active templates. If clientId is provided, fetches matching client templates along with default templates. If no clientId is provided, fetches only default templates.
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: ID of the client to fetch templates for
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get(
    '/',
    authenticate,
    ChecklistController.getAllTemplates
);



/**
 * @swagger
 * /checklists/{id}:
 *   put:
 *     summary: Update template (creates new version)
 *     description: Deactivates the old version and creates a new version of the template.
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: New version created successfully
 */
router.put(
    '/:id',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
    validatePayload(updateChecklistTemplateSchema),
    ChecklistController.updateTemplate
);

/**
 * @swagger
 * /checklists/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 */
router.get(
    '/:id',
    authenticate,
    ChecklistController.getTemplate
);

export default router;
