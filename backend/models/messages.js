import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export const Messages = mongoose.model('messages', messageSchema);
