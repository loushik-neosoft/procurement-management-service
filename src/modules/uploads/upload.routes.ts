import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '@middlewares/auth';
import { upload } from '@middlewares/upload';

const router = Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload a file
 *     description: Uploads a file to the server. The file is stored in the uploads directory and a URL is returned for accessing it.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload. Supported formats include images and documents.
 *     responses:
 *       200:
 *         description: File uploaded successfully.
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
 *                     url:
 *                       type: string
 *                       description: The full URL to access the uploaded file.
 *                     filename:
 *                       type: string
 *                       description: The generated filename of the uploaded file on the server.
 *       400:
 *         description: No file uploaded or invalid file type.
 */
router.post(
    '/',
    authenticate,
    upload.single('file'),
    UploadController.uploadFile
);

/**
 * @swagger
 * /uploads/{filename}:
 *   get:
 *     summary: Get a file by filename
 *     description: Retrieves a file from the server using its filename. The file is served directly.
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the file to retrieve from the uploads directory.
 *     responses:
 *       200:
 *         description: File retrieved successfully.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found.
 */
router.get(
    '/:filename',
    UploadController.getFile
);

/**
 * @swagger
 * /uploads/{filename}:
 *   delete:
 *     summary: Delete a file by filename
 *     description: Deletes a file from the server. Only authenticated users can delete files.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the file to delete from the uploads directory.
 *     responses:
 *       200:
 *         description: File deleted successfully.
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
 *                   example: File deleted successfully
 *                   description: Confirmation message.
 *       404:
 *         description: File not found.
 */
router.delete(
    '/:filename',
    authenticate,
    UploadController.deleteFile
);

export default router;
