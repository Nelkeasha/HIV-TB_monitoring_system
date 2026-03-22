import { Router } from 'express';
import {
  createVisit,
  getPatientVisits,
  getVisitById,
  updateVisit,
} from '../controllers/visit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Visits
 *   description: Patient visit management
 */

/**
 * @swagger
 * /visits:
 *   post:
 *     summary: Record a new patient visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patient_id, visit_date, visit_type]
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               visit_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-21T10:00:00Z"
 *               visit_type:
 *                 type: string
 *                 enum: [home_visit, facility_visit, phone_call]
 *               notes:
 *                 type: string
 *                 example: "Patient is responding well to treatment"
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["fever", "cough"]
 *               side_effects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nausea"]
 *               missed_doses:
 *                 type: integer
 *                 example: 2
 *               next_visit_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *     responses:
 *       201:
 *         description: Visit recorded successfully
 *       404:
 *         description: Patient not found
 */
router.post('/', authenticate, authorize('chw'), createVisit);

/**
 * @swagger
 * /visits/patient/{patient_id}:
 *   get:
 *     summary: Get all visits for a patient
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of visits
 *       404:
 *         description: Patient not found
 */
router.get('/patient/:patient_id', authenticate, getPatientVisits);

/**
 * @swagger
 * /visits/{id}:
 *   get:
 *     summary: Get a single visit by ID
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Visit details
 *       404:
 *         description: Visit not found
 */
router.get('/:id', authenticate, getVisitById);

/**
 * @swagger
 * /visits/{id}:
 *   put:
 *     summary: Update a visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               side_effects:
 *                 type: array
 *                 items:
 *                   type: string
 *               missed_doses:
 *                 type: integer
 *               next_visit_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Visit updated
 */
router.put('/:id', authenticate, authorize('chw', 'admin'), updateVisit);

export default router;