// controllers/liveblocksController.js
import { Liveblocks } from '@liveblocks/node';
import { UserModel } from '../models/userModel.js'; // Import your UserModel
import { DocumentModel } from '../models/DocumentModel.js'; // *** IMPORT DocumentModel ***
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation

// Ensure LIVEBLOCKS_SECRET_KEY is loaded
if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    console.error("FATAL ERROR: LIVEBLOCKS_SECRET_KEY environment variable is not defined.".red);
}

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export const liveblocksController = {
    authorize: async (req, res) => {
        const userId = req.userId; // From 
       
        const { room: documentId } = req.body;

        if (!userId) {
             return res.status(401).json({ message: 'Unauthorized: Missing user ID.' });
        }
        if (!documentId || typeof documentId !== 'string' || !mongoose.Types.ObjectId.isValid(documentId)) {
             return res.status(400).json({ message: 'Bad Request: Missing or invalid document ID (room).' });
        }

        try {
            const document = await DocumentModel.findById(documentId).select('ownerId collaborators'); // Select only needed fields

            if (!document) {
                return res.status(404).json({ message: 'Document (room) not found.' });
            }

            // Check if the authenticated user is the owner OR is in the collaborators list
            const isOwner = document.ownerId.toString() === userId;
            // Ensure collaborators array exists before checking
            const isCollaborator = document.collaborators && document.collaborators.some(id => id.toString() === userId);

            if (!isOwner && !isCollaborator) {
                // If user is neither owner nor collaborator, deny access
                return res.status(403).json({ message: 'Forbidden: You do not have access to this document (room).' });
            }
            
            // If permission check passed, proceed to get user info for Liveblocks presence
            const user = await UserModel.findById(userId).select('firstName lastName profile.image.url');
            if (!user) {
                 // Should not happen if middleware passed and user exists, but check defensively
                 return res.status(404).json({ message: 'Authenticated user details not found.' });
            }

            const getRandomColor = () => {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            };

            const userInfo = {
                name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
                picture: user.profile?.image?.url || null,
                color: getRandomColor(),
                colorLight: getRandomColor(),
            };

            // Prepare and Authorize the Liveblocks session for the documentId (room)
            const session = liveblocks.prepareSession(
                userId, // User's application ID
                { userInfo: userInfo }
            );

            // Allow access to the specific room (documentId)
            session.allow(documentId, session.FULL_ACCESS); // Grant full write access within Liveblocks room

            const { status, body } = await session.authorize();

            return res.status(status).send(body);

        } catch (error) {
            console.error('Liveblocks authentication error:'.red, error);
            return res.status(500).json({ message: 'Internal Server Error during Liveblocks authorization.' });
        }
    }
};