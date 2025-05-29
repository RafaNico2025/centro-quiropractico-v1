import { Router } from 'express';
import { authenticateToken } from '../auth/middleware.js';
import { getGeneralStats, getAppointmentStats, getPatientStats } from './controller.js';

const router = Router();

// Rutas protegidas con autenticación
router.get('/general', authenticateToken, getGeneralStats);
router.get('/appointments', authenticateToken, getAppointmentStats);
router.get('/patients', authenticateToken, getPatientStats);

export default router;
