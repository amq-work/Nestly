import { Router } from 'express';
import { getServices, getCategories, getLabour } from '../controllers/data.controller';

const router = Router();

router.get('/services', getServices);
router.get('/categories', getCategories);
router.get('/labour', getLabour);

export default router;
