import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
