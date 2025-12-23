import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate, authorize } from '@middlewares/auth';
import { Role } from '@prisma/client';
import validatePayload from '@middlewares/validator';
import { createOrderSchema, updateOrderStatusSchema } from './order.schema';
import { SubmissionController } from './submission.controller';
import { submitChecklistSchema } from './submission.schema';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (PM only)
 *     description: Creates a new procurement order. Either a checklist template ID or a previous order ID must be provided to define the checklist for this order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - clientId
 *               - inspectionManagerId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title/name of the order.
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the client for whom this order is being created.
 *               checklistTemplateId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the checklist template to use for this order. Required if previousOrderId is not provided.
 *               previousOrderId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of a previous order to copy the checklist from. Required if checklistTemplateId is not provided.
 *               inspectionManagerId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the inspection manager assigned to this order.
 *     responses:
 *       201:
 *         description: Order created successfully.
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
 *                     order:
 *                       type: object
 *                       description: The created order details.
 *       400:
 *         description: Validation error (e.g., neither checklistTemplateId nor previousOrderId provided).
 *       403:
 *         description: Forbidden. Only Procurement Managers can create orders.
 *   get:
 *     summary: List orders
 *     description: Retrieves a list of orders based on the user's role and permissions.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully.
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
 *                     orders:
 *                       type: array
 *                       description: Array of orders.
 *                       items:
 *                         type: object
 */
router.post(
    '/',
    authenticate,
    authorize(Role.PROCUREMENT_MANAGER),
    validatePayload(createOrderSchema),
    OrderController.create
);

router.get(
    '/',
    authenticate,
    OrderController.list
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     description: Retrieves detailed information about a specific order by its ID.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the order to retrieve.
 *     responses:
 *       200:
 *         description: Order details retrieved successfully.
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
 *                     order:
 *                       type: object
 *                       description: Detailed order information.
 *       404:
 *         description: Order not found.
 */
router.get(
    '/:id',
    authenticate,
    OrderController.getById
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Updates the status of an order. Available to Admin, Procurement Manager, and Inspection Manager.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CHECKLIST_CREATED, IN_PROGRESS, INSPECTION_COMPLETED, COMPLETED, CANCELLED]
 *                 description: New status for the order.
 *     responses:
 *       200:
 *         description: Order status updated successfully.
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
 *                     order:
 *                       type: object
 *                       description: Updated order details.
 *       400:
 *         description: Invalid status value.
 *       404:
 *         description: Order not found.
 */
router.patch(
    '/:id/status',
    authenticate,
    authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.INSPECTION_MANAGER),
    validatePayload(updateOrderStatusSchema),
    OrderController.updateStatus
);

/**
 * @swagger
 * /orders/submissions:
 *   post:
 *     summary: Submit a checklist (Inspection Manager only)
 *     description: Submits answers for an order's checklist. Validates against the order's checklist snapshot. Can be a draft or final submission.
 *     tags: [Checklist Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, answers]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the order for which the checklist is being submitted.
 *               answers:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Map of question keys to answers. The structure depends on the question types in the checklist.
 *               isFinal:
 *                 type: boolean
 *                 default: false
 *                 description: Indicates whether this is a final submission or a draft. Defaults to false.
 *     responses:
 *       201:
 *         description: Submission created successfully.
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
 *                     submission:
 *                       type: object
 *                       description: The created submission details.
 *       400:
 *         description: Validation error (invalid answers or missing required fields).
 *       404:
 *         description: Order not found.
 */
router.post(
    '/submissions',
    authenticate,
    authorize(Role.INSPECTION_MANAGER),
    validatePayload(submitChecklistSchema),
    SubmissionController.submitChecklist
);

/**
 * @swagger
 * /orders/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     description: Retrieves a specific checklist submission by its unique identifier.
 *     tags: [Checklist Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the submission to retrieve.
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully.
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
 *                     submission:
 *                       type: object
 *                       description: The checklist submission details.
 *       404:
 *         description: Submission not found.
 */
router.get(
    '/submissions/:id',
    authenticate,
    SubmissionController.getSubmission
);

/**
 * @swagger
 * /orders/{orderId}/submissions:
 *   get:
 *     summary: Get submissions for an order
 *     description: Retrieves all checklist submissions associated with a specific order.
 *     tags: [Checklist Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the order to retrieve submissions for.
 *     responses:
 *       200:
 *         description: List of submissions retrieved successfully.
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
 *                     submissions:
 *                       type: array
 *                       description: Array of checklist submissions for this order.
 *                       items:
 *                         type: object
 *       404:
 *         description: Order not found.
 */
router.get(
    '/:orderId/submissions',
    authenticate,
    SubmissionController.getSubmissionsByOrder
);

export default router;
