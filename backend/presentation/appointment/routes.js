import { Router } from 'express';
import appointmentController from './controller.js';

const router = Router();

// Rutas para turnos
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router; 