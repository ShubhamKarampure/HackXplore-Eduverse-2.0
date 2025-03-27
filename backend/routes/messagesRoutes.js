import express from 'express'
import { addMessage, deleteMessages, getMessages } from '../controllers/messagesController.js';

const router = express.Router();

router.post('/message/add', addMessage);
router.get('/message/get', getMessages);
router.delete('/message/delete', deleteMessages);

export default router;