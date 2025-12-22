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
 *               - clientId
 *               - items
 *             properties:
 *               clientId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created
 *       403:
 *         description: Forbidden
 *   get:
 *     summary: List orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
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
 *     tags: [Orders]
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
 *         description: Order details
 *       404:
 *         description: Order not found
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
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
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
 *     description: Submits answers for an order's checklist. Validates against the order's snapshot.
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
 *               answers:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Map of question keys to answers
 *               isFinal:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Submission created successfully
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
 *     tags: [Checklist Submissions]
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
 *         description: Submission details
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
 *     tags: [Checklist Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get(
    '/:orderId/submissions',
    authenticate,
    SubmissionController.getSubmissionsByOrder
);

export default router;
