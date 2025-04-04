// models/DocumentModel.js
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Document name is required.'],
            trim: true,
            default: 'Untitled Document',
        },

        // The Liveblocks room ID will be the MongoDB _id of this document instance.
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users', // Reference to your UserModel collection name ('users')
            required: true,
            index: true, // Index for faster lookup of documents owned by a user
        },

        // Store users who have been explicitly granted access (excluding the owner)
        collaborators: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }],
            default: [],
            index: true, // Index for faster lookup of documents a user collaborates on
        },

        // Type of the document: either 'text' or 'code'
        type: {
            type: String,
            enum: ['text', 'code'],
            required: true,
            default: 'text', // Default to 'text'
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

export const DocumentModel = mongoose.model('Document', DocumentSchema);