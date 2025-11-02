import express from 'express';
import { globalSearch } from '../controllers/searchController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/global', authenticate, globalSearch);

export default router;