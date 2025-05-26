// routes/documentRoutes.js
import express from 'express';
import { documentController } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Your auth middleware

const router = express.Router();

router.use(authMiddleware);

// POST /api/v1/documents - Create a new document
router.post('/', documentController.createDocument);

// GET /api/v1/documents - Get documents accessible by the current user
router.get('/', documentController.getMyDocuments);

// POST /api/v1/documents/:id/collaborators - Add a user to a document's collaborators
router.post('/share', documentController.shareDocument);


export const documentRouter = router; // Use default export if preferred