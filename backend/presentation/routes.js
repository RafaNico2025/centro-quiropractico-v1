import { Router } from 'express';
import authRoutes from './auth/routes.js';
import appointmentRoutes from './appointment/routes.js';
import patientRoutes from './patient/routes.js';
import userRoutes from './user/routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patients', patientRoutes);
router.use('/users', userRoutes);

export default router;