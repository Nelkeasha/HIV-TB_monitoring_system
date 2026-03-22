import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import visitRoutes from './visit.routes';
import adherenceRoutes from './adherence.routes';
import stockRoutes from './stock.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/visits', visitRoutes);
router.use('/adherence', adherenceRoutes);
router.use('/stock', stockRoutes);

export default router;