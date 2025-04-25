import { Router } from 'express';
import {
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome,
  getIncomesByDateRange,
  getIncomesByPatient
} from './controller.js';

const router = Router();

// Rutas para los ingresos
router.post('/', createIncome);
router.get('/:id', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);
router.get('/date-range', getIncomesByDateRange);
router.get('/patient/:patientId', getIncomesByPatient);

export default router; 