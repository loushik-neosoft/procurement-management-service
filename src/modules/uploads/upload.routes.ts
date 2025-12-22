import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '@middlewares/auth';
import { upload } from '@middlewares/upload';

const router = Router();

router.post(
    '/',
    authenticate,
    upload.single('file'),
    UploadController.uploadFile
);

export default router;
