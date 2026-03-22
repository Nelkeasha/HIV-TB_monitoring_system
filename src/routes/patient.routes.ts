import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management endpoints
 */

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       409:
 *         description: Patient already exists
 */
router.post('/', authenticate, authorize('chw', 'admin'), createPatient);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: diseaseType
 *         schema:
 *           type: string
 *           enum: [HIV, TB, HIV_TB]
 *         description: Filter by disease type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or national ID
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', authenticate, getPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get a single patient with recent visits and adherence
 *     tags: [Patients]
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
 *         description: Patient details
 *       404:
 *         description: Patient not found
 */
router.get('/:id', authenticate, getPatientById);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient information
 *     tags: [Patients]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               artStartDate:
 *                 type: string
 *                 format: date
 *               tbTreatmentStartDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.put('/:id', authenticate, authorize('chw', 'admin'), updatePatient);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Deactivate a patient
 *     tags: [Patients]
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
 *         description: Patient deactivated
 */
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

export default router;