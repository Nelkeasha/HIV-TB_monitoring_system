import { Router } from 'express';
import {
  recordAdherence,
  getPatientAdherence,
  getAllAdherenceAlerts,
} from '../controllers/adherence.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Adherence
 *   description: Medication adherence tracking
 */

/**
 * @swagger
 * /adherence:
 *   post:
 *     summary: Record a medication adherence entry
 *     tags: [Adherence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, record_date, doses_taken, doses_prescribed]
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               record_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-21"
 *               doses_taken:
 *                 type: integer
 *                 example: 28
 *               doses_prescribed:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Adherence recorded with alert status
 *       400:
 *         description: Doses taken exceed doses prescribed
 *       404:
 *         description: Patient not found
 */
router.post('/', authenticate, authorize('chw'), recordAdherence);

/**
 * @swagger
 * /adherence/alerts:
 *   get:
 *     summary: Get all patients with adherence below 95% in last 30 days
 *     tags: [Adherence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of adherence alerts
 */
router.get('/alerts', authenticate, getAllAdherenceAlerts);

/**
 * @swagger
 * /adherence/patient/{patient_id}:
 *   get:
 *     summary: Get adherence history for a patient
 *     tags: [Adherence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           example: 3
 *         description: How many months back to fetch (default is 3)
 *     responses:
 *       200:
 *         description: Adherence records with summary
 *       404:
 *         description: Patient not found
 */
router.get('/patient/:patient_id', authenticate, getPatientAdherence);

export default router;