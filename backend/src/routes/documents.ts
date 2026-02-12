import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/upload', documentController.upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;
