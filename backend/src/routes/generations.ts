import { Router } from 'express';
import * as generationController from '../controllers/generationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/lesson', generationController.generateLesson);
router.post('/program', generationController.generateProgram);
router.post('/assessment', generationController.generateAssessment);
router.get('/', generationController.getGenerations);
router.get('/:id', generationController.getGeneration);
router.patch('/:id', generationController.updateGeneration);

export default router;
