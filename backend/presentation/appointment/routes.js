import { Router } from 'express';
import { 
  createAppointment, 
  getAppointments, 
  getAppointmentById, 
  updateAppointment, 
  deleteAppointment,
  sendAppointmentReminderManual,
  requestAppointment,
  getAvailableSlots,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  scheduleAppointment
} from './controller.js';
import { authenticateToken } from '../auth/middleware.js';

const router = Router();

// Rutas protegidas con autenticación
router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getAppointments);
router.get('/available-slots', authenticateToken, getAvailableSlots);
router.get('/pending', authenticateToken, getPendingAppointments); // Nueva ruta para solicitudes pendientes
router.get('/:id', authenticateToken, getAppointmentById);
router.put('/:id', authenticateToken, updateAppointment);
router.delete('/:id', authenticateToken, deleteAppointment);
router.post('/:id/send-reminder', authenticateToken, sendAppointmentReminderManual);
router.post('/request', authenticateToken, requestAppointment);

// Nuevas rutas para gestión de solicitudes
router.put('/:id/approve', authenticateToken, approveAppointment);
router.put('/:id/reject', authenticateToken, rejectAppointment);
router.put('/:id/schedule', authenticateToken, scheduleAppointment);

export default router; 