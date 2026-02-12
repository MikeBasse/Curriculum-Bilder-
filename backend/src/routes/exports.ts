import { Router } from 'express';
import * as exportController from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/pdf', exportController.exportPdf);
router.post('/docx', exportController.exportDocx);
router.get('/:id/download', exportController.downloadExport);

export default router;
