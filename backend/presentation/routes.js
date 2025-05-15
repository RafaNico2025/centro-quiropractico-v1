import express from 'express';
import authRoutes from './auth/routes.js';
import userRoutes from './user/routes.js';
import appointmentRoutes from './appointment/routes.js';
import patientRoutes from './patient/routes.js';
import medicalHistoryRoutes from './medicalHistory/routes.js';
import incomeRoutes from './income/routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/medical-history', medicalHistoryRoutes);
router.use('/incomes', incomeRoutes);

export default router;