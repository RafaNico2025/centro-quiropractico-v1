import { Router } from 'express';
import {
  createMedicalHistory,
  getMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getPatientMedicalHistory,
  getAllMedicalHistories
} from './controller.js';

const router = Router();

// Rutas para el historial médico
router.post('/', createMedicalHistory);
router.get('/:id', getMedicalHistory);
router.get('/', getAllMedicalHistories);
router.put('/:id', updateMedicalHistory);
router.delete('/:id', deleteMedicalHistory);
router.get('/patient/:patientId', getPatientMedicalHistory);

export default router;
