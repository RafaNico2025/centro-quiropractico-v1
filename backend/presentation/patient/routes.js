import { Router } from 'express';
import { createPatient, getPatients, getPatientById, updatePatient, deletePatient } from './controller.js';

const router = Router();

// Rutas para pacientes
router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router; 