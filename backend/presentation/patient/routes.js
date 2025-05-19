import { Router } from 'express';
import { createPatient, getPatients, getPatientById, updatePatient, deletePatient } from './controller.js';
import { authenticateToken } from '../auth/middleware.js';

const router = Router();

// Rutas para pacientes
router.post('/', authenticateToken, createPatient);
router.get('/', authenticateToken, getPatients);
router.get('/:id', authenticateToken, getPatientById);
router.put('/:id', authenticateToken, updatePatient);
router.delete('/:id', authenticateToken, deletePatient);

export default router; 