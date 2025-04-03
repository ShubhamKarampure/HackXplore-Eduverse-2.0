// routes/liveblocksRoutes.js
import express from 'express';
import { liveblocksController } from '../controllers/liveblocksController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Import your existing middleware

const router = express.Router();

// Define the POST route for Liveblocks authentication
// It first runs your standard authMiddleware to get req.userId,
// then runs the liveblocksController.authorize function.
router.post('/auth', authMiddleware, liveblocksController.authorize);

// Export the router using ES Module syntax
export const liveblocksRouter = router;