// controllers/documentController.js
import { DocumentModel } from '../models/DocumentModel.js';
import mongoose from 'mongoose';
import { UserModel } from '../models/userModel.js';

export const documentController = {
    // --- Create a new document ---
    createDocument: async (req, res) => {
        try {
            const { name, type } = req.body;
            const ownerId = req.userId; // From authMiddleware

            if (!ownerId) {
                return res.status(401).json({ message: 'Authentication required.' });
            }

            const newDocument = new DocumentModel({
                name: name || 'Untitled Document', // Use provided name or default
                ownerId: ownerId,
                collaborators: [], // Starts with no collaborators
                type: type || 'text', // Use provided type or default to 'text'
            });

            await newDocument.save();

            // Return the full document object, including its _id
            res.status(201).json(newDocument);

        } catch (error) {
            console.error('Error creating document:'.red, error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: 'Validation failed', errors: error.errors });
            }
            res.status(500).json({ message: 'Server error during document creation.' });
        }
    },

    // --- Get documents accessible by the current user ---
    getMyDocuments: async (req, res) => {
        try {
            const userId = req.userId; // From authMiddleware

            if (!userId) {
                return res.status(401).json({ message: 'Authentication required.' });
            }

            // Find documents where the user is the owner OR is in the collaborators array
            const documents = await DocumentModel.find({
                $or: [
                    { ownerId: userId },
                    { collaborators: userId } // Check if userId is in the collaborators array
                ]
            })
            .sort({ updatedAt: -1 }) // Sort by most recently updated
            .populate('ownerId', 'firstName lastName profile.image') // Get owner details
            .populate('collaborators', 'firstName lastName profile.image') // Get collaborator details
            .lean(); // Convert to plain JavaScript object for easier manipulation

            res.status(200).json(documents);

        } catch (error) {
            console.error('Error fetching documents:'.red, error);
            res.status(500).json({ message: 'Server error fetching documents.' });
        }
    },

    // --- Add a collaborator to a document ---
    shareDocument: async (req, res) => {
        try {
            const ownerId = req.userId; // Authenticated user (must be owner)
            const { userIdToAdd, documentId } = req.body; // Extract documentId correctly

            if (!ownerId) return res.status(401).json({ message: 'Authentication required.' });
            if (!userIdToAdd) return res.status(400).json({ message: 'User ID to add is required.' });

            if (!mongoose.Types.ObjectId.isValid(documentId))
                return res.status(400).json({ message: 'Invalid document ID format.' });

            if (!mongoose.Types.ObjectId.isValid(userIdToAdd))
                return res.status(400).json({ message: 'Invalid user ID format for collaborator.' });

            if (ownerId === userIdToAdd)
                return res.status(400).json({ message: 'Cannot add owner as a collaborator.' });

            // Verify if the user to be added exists
            const userExists = await UserModel.findById(userIdToAdd);
            if (!userExists) return res.status(404).json({ message: 'User not found.' });

            // Find document and check ownership in one query for efficiency
            const document = await DocumentModel.findOne({ _id: documentId, ownerId });

            if (!document) return res.status(403).json({ message: 'Forbidden: Only the document owner can share.' });

            // Add collaborator if not already present
            const updateResult = await DocumentModel.updateOne(
                { _id: documentId },
                { $addToSet: { collaborators: userIdToAdd } }
            );

            if (updateResult.modifiedCount > 0)
                return res.status(200).json({ message: 'Collaborator added successfully.' });

            return res.status(200).json({ message: 'User is already a collaborator or could not be added.' });

        } catch (error) {
            console.error('Error sharing document:', error);
            res.status(500).json({ message: 'Server error while sharing document.' });
        }
    }
};