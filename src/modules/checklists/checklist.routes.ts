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
 *                 description: Name of the checklist template. Must be at least 3 characters long.
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional UUID of the client this template is associated with. If not provided, template will be a default template.
 *               source:
 *                 type: string
 *                 enum: [DEFAULT, CLIENT]
 *                 description: Source of the template. DEFAULT for system-wide templates, CLIENT for client-specific templates.
 *               questions:
 *                 type: array
 *                 description: Array of questions for the checklist. Must contain at least 3 questions.
 *                 items:
 *                   type: object
 *                   required: [key, label, type, orderIndex]
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: Unique identifier for the question within this template.
 *                     label:
 *                       type: string
 *                       description: Display label for the question.
 *                     type:
 *                       type: string
 *                       enum: [BOOLEAN, DROPDOWN, MULTI_SELECT, TEXT, IMAGE_UPLOAD]
 *                       description: Type of input field for this question.
 *                     required:
 *                       type: boolean
 *                       description: Whether this question is required to be answered. Defaults to true.
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of options for DROPDOWN and MULTI_SELECT question types.
 *                     orderIndex:
 *                       type: integer
 *                       description: Order position of this question in the checklist.
 *     responses:
 *       201:
 *         description: Template created successfully.
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
 *                   properties:
 *                     template:
 *                       type: object
 *                       description: The created checklist template.
 *       400:
 *         description: Invalid input (validation errors, missing required fields).
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
 *           format: uuid
 *         description: Optional UUID of the client to fetch templates for. When provided, returns both client-specific and default templates. When omitted, returns only default templates.
 *     responses:
 *       200:
 *         description: List of templates retrieved successfully.
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
 *                   properties:
 *                     templates:
 *                       type: array
 *                       description: Array of active checklist templates.
 *                       items:
 *                         type: object
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
 *     description: Deactivates the old version and creates a new version of the template with updated details.
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the template to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the checklist template.
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Updated client UUID for the template.
 *               source:
 *                 type: string
 *                 enum: [DEFAULT, CLIENT]
 *                 description: Updated source type of the template.
 *               questions:
 *                 type: array
 *                 description: Updated array of questions for the checklist.
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: Unique identifier for the question.
 *                     label:
 *                       type: string
 *                       description: Display label for the question.
 *                     type:
 *                       type: string
 *                       enum: [BOOLEAN, DROPDOWN, MULTI_SELECT, TEXT, IMAGE_UPLOAD]
 *                       description: Type of input field.
 *                     required:
 *                       type: boolean
 *                       description: Whether this question is required.
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Options for DROPDOWN and MULTI_SELECT types.
 *                     orderIndex:
 *                       type: integer
 *                       description: Order position of the question.
 *     responses:
 *       200:
 *         description: New version created successfully.
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
 *                   properties:
 *                     template:
 *                       type: object
 *                       description: The updated checklist template.
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
 *     description: Retrieves a specific checklist template by its unique identifier.
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the template to retrieve.
 *     responses:
 *       200:
 *         description: Template details retrieved successfully.
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
 *                   properties:
 *                     template:
 *                       type: object
 *                       description: The checklist template details.
 *       404:
 *         description: Template not found.
 */
router.get(
    '/:id',
    authenticate,
    ChecklistController.getTemplate
);

export default router;
