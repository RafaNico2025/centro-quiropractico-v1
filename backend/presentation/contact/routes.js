import { Router } from 'express';
import { sendContactMessage } from './controller.js';

const router = Router();

router.post('/', sendContactMessage);

export default router; 