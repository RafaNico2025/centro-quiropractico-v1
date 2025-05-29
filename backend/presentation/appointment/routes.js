import { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, sendAppointmentReminderManual, requestAppointment } from './controller.js';
import { Router } from 'express';
import { authenticateToken } from '../auth/middleware.js';

const router = Router();

// Rutas protegidas con autenticación
router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getAppointments);
router.get('/:id', authenticateToken, getAppointmentById);
router.put('/:id', authenticateToken, updateAppointment);
router.delete('/:id', authenticateToken, deleteAppointment);
router.post('/:id/send-reminder', authenticateToken, sendAppointmentReminderManual);
router.post('/request', authenticateToken, requestAppointment);

export default router; 