import express from 'express';
import { universalSearch, getSearchSuggestions } from '../controllers/search.controller.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = express.Router();

router.get('/', cacheMiddleware(300), universalSearch);
router.get('/suggestions', cacheMiddleware(300), getSearchSuggestions);

export default router;
