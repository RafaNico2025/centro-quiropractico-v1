import { Router } from 'express';
import { authenticateToken } from '../auth/middleware.js';
import { getGeneralStats, getAppointmentStats, getPatientStats, exportStatsToExcel } from './controller.js';

const router = Router();

// Rutas protegidas con autenticación
router.get('/general', authenticateToken, getGeneralStats);
router.get('/appointments', authenticateToken, getAppointmentStats);
router.get('/patients', authenticateToken, getPatientStats);
router.get('/export', authenticateToken, exportStatsToExcel);

export default router;
