// routes/liveblocksRoutes.js
import express from 'express';
import { liveblocksController } from '../controllers/liveblocksController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Import your existing middleware

const router = express.Router();

router.post('/auth', authMiddleware, liveblocksController.authorize);

// Export the router using ES Module syntax
export const liveblocksRouter = router;