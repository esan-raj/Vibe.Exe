import { Router } from 'express';
import {
  classifyIntent,
  extractEntities,
  getRecommendations,
  estimateBudget,
} from '../services/mlModels';

const router = Router();

// ML Model endpoints
router.post('/intent', classifyIntent);
router.post('/ner', extractEntities);
router.post('/recommendations', getRecommendations);
router.post('/budget', estimateBudget);

export default router;










