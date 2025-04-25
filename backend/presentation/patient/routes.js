import { Router } from 'express';
import patientController from './controller.js';

const router = Router();

// Rutas para pacientes
router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

export default router; 