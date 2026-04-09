import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createFhirAdherenceObservation } from '../services/fhir.service';

export const recordAdherence = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patient_id,
      record_date,
      doses_taken,
      doses_prescribed,
    } = req.body;

    const chwId = req.user!.userId;

    // Check patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patient_id } });
    if (!patient || !patient.isActive) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    // Validate doses
    if (doses_taken > doses_prescribed) {
      res.status(400).json({ success: false, message: 'Doses taken cannot exceed doses prescribed' });
      return;
    }

    // Calculate adherence percentage
    const adherencePercentage = Math.round((doses_taken / doses_prescribed) * 100);

    const record = await prisma.adherenceRecord.create({
      data: {
        patientId:           patient_id,
        chwId:               chwId,
        recordDate:          new Date(record_date),
        dosesTaken:          doses_taken,
        dosesPrescribed:     doses_prescribed,
        adherencePercentage: adherencePercentage,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        chw:     { select: { id: true, name: true } },
      },
    });

    try {
      const fhirPatient = await prisma.patient.findUnique({
        where: { id: patient_id },
        select: { fhirId: true },
      });

      if (fhirPatient?.fhirId) {
        await createFhirAdherenceObservation({
          fhirPatientId: fhirPatient.fhirId,
          adherencePercentage: adherencePercentage,
          recordDate: new Date(record_date),
          dosesTaken: doses_taken,
          dosesPrescribed: doses_prescribed,
        });
      }
    } catch (fhirError) {
      console.warn("FHIR adherence sync failed:", fhirError);
    }

    // Build alert if adherence is below 95%
    const alert = adherencePercentage < 95
      ? {
          alert: true,
          level: adherencePercentage < 50 ? 'critical' : 'warning',
          message: `Adherence is ${adherencePercentage}%. Immediate follow-up required.`,
        }
      : {
          alert: false,
          level: 'good',
          message: `Adherence is ${adherencePercentage}%. Patient is on track.`,
        };

    res.status(201).json({
      success: true,
      message: 'Adherence recorded',
      data: { record, ...alert },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record adherence', error: String(error) });
  }
};

export const getPatientAdherence = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patient_id)
      ? req.params.patient_id[0]
      : req.params.patient_id;
    if (!patientId) {
      res.status(400).json({ success: false, message: 'Patient id is required' });
      return;
    }
    const { months = '3' } = req.query;

    // Check patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true, diseaseType: true },
    });
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - Number(months));

    const records = await prisma.adherenceRecord.findMany({
      where: {
        patientId,
        recordDate: { gte: fromDate },
      },
      include: {
        chw: { select: { id: true, name: true } },
      },
      orderBy: { recordDate: 'desc' },
    });

    // Calculate average adherence
    const averageAdherence = records.length
      ? Math.round(records.reduce((sum, r) => sum + r.adherencePercentage, 0) / records.length)
      : 0;

    // Count how many records are below 95%
    const missedCount = records.filter(r => r.adherencePercentage < 95).length;

    res.json({
      success: true,
      message: 'Adherence data fetched',
      data: {
        patient,
        summary: {
          average_adherence: averageAdherence,
          total_records:     records.length,
          missed_count:      missedCount,
          status:            averageAdherence >= 95 ? 'good' : averageAdherence >= 50 ? 'warning' : 'critical',
        },
        records,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch adherence', error: String(error) });
  }
};

export const getAllAdherenceAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    // Get all records below 95% in the last 30 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const alerts = await prisma.adherenceRecord.findMany({
      where: {
        adherencePercentage: { lt: 95 },
        recordDate:          { gte: fromDate },
        ...(role === 'chw' && { chwId: userId }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        chw:     { select: { id: true, name: true } },
      },
      orderBy: { adherencePercentage: 'asc' },
    });

    res.json({
      success: true,
      message: 'Adherence alerts fetched',
      data: {
        total_alerts: alerts.length,
        alerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts', error: String(error) });
  }
};