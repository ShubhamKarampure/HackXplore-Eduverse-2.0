// controllers/documentController.js
import { DocumentModel } from '../models/DocumentModel.js';
import mongoose from 'mongoose';

export const documentController = {
    // --- Create a new document ---
    createDocument: async (req, res) => {
        try {
            const { name } = req.body;
            const ownerId = req.userId; // From authMiddleware

            if (!ownerId) {
                return res.status(401).json({ message: 'Authentication required.' });
            }

            const newDocument = new DocumentModel({
                name: name || 'Untitled Document', // Use provided name or default
                ownerId: ownerId,
                collaborators: [], // Starts with no collaborators
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
            .select('name ownerId createdAt updatedAt'); // Select fields to return

            res.status(200).json(documents);

        } catch (error) {
            console.error('Error fetching documents:'.red, error);
            res.status(500).json({ message: 'Server error fetching documents.' });
        }
    },

    // --- Add a collaborator to a document ---
    shareDocument: async (req, res) => {
        try {
            const documentId = req.params.id; // Document ID from URL parameter
            const ownerId = req.userId;      // Current user (must be the owner to share)
            const { userIdToAdd } = req.body; // User ID to add as collaborator

            if (!ownerId) {
                return res.status(401).json({ message: 'Authentication required.' });
            }
            if (!userIdToAdd) {
                return res.status(400).json({ message: 'User ID to add is required.' });
            }
            if (!mongoose.Types.ObjectId.isValid(documentId)) {
                 return res.status(400).json({ message: 'Invalid document ID format.' });
            }
             if (!mongoose.Types.ObjectId.isValid(userIdToAdd)) {
                 return res.status(400).json({ message: 'Invalid user ID format for collaborator.' });
            }
            if (ownerId === userIdToAdd) {
                 return res.status(400).json({ message: 'Cannot add owner as a collaborator.' });
            }


            // Find the document and ensure the current user is the owner
            const document = await DocumentModel.findById(documentId);

            if (!document) {
                return res.status(404).json({ message: 'Document not found.' });
            }

            // Authorization check: Only the owner can share
            if (document.ownerId.toString() !== ownerId) {
                return res.status(403).json({ message: 'Forbidden: Only the document owner can share.' });
            }

             // TODO Optional: Check if userIdToAdd actually exists in the UserModel

            // Add the user to the collaborators array using $addToSet to avoid duplicates
            const updateResult = await DocumentModel.updateOne(
                { _id: documentId },
                { $addToSet: { collaborators: userIdToAdd } }
            );

             if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 1) {
                  return res.status(200).json({ message: 'User is already a collaborator or could not be added.' });
             }
             if (updateResult.modifiedCount > 0) {
                  // Successfully added
                   res.status(200).json({ message: 'Collaborator added successfully.' });
              } else {
                  // Should not happen if document was found, but handle defensively
                   return res.status(404).json({ message: 'Document not found or update failed.' });
              }


        } catch (error) {
            console.error('Error sharing document:'.red, error);
            res.status(500).json({ message: 'Server error while sharing document.' });
        }
    },
};