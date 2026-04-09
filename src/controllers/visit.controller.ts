import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createFhirTask } from '../services/fhir.service';

const firstParam = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patient_id,
      visit_date,
      visit_type,
      notes,
      symptoms,
      side_effects,
      missed_doses,
      next_visit_date,
    } = req.body;

    const chwId = req.user!.userId;

    // Check patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patient_id } });
    if (!patient || !patient.isActive) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    const visit = await prisma.visit.create({
      data: {
        patientId:     patient_id,
        chwId:         chwId,
        visitDate:     new Date(visit_date),
        visitType:     visit_type,
        notes,
        symptoms:      symptoms || [],
        sideEffects:   side_effects || [],
        missedDoses:   missed_doses || 0,
        nextVisitDate: next_visit_date ? new Date(next_visit_date) : null,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
        chw: {
          select: { id: true, name: true },
        },
      },
    });

    try {
      if (patient.fhirId) {
        await createFhirTask({
          fhirPatientId: patient.fhirId,
          chwName: visit.chw.name,
          visitDate: new Date(visit_date),
          visitType: visit.visitType,
          notes: visit.notes ?? undefined,
        });
      }
    } catch (fhirError) {
      console.warn('FHIR visit sync failed:', fhirError);
    }

    res.status(201).json({ success: true, message: 'Visit recorded', data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record visit', error: String(error) });
  }
};

export const getPatientVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = firstParam(req.params.patient_id);
    if (!patientId) {
      res.status(400).json({ success: false, message: 'Patient id is required' });
      return;
    }

    // Check patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    const visits = await prisma.visit.findMany({
      where: { patientId },
      include: {
        chw: { select: { id: true, name: true } },
      },
      orderBy: { visitDate: 'desc' },
    });

    res.json({ success: true, message: 'Visits fetched', data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch visits', error: String(error) });
  }
};

export const getVisitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = firstParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: 'Visit id is required' });
      return;
    }

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, diseaseType: true } },
        chw:     { select: { id: true, name: true } },
      },
    });

    if (!visit) {
      res.status(404).json({ success: false, message: 'Visit not found' });
      return;
    }

    res.json({ success: true, message: 'Visit fetched', data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch visit', error: String(error) });
  }
};

export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = firstParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: 'Visit id is required' });
      return;
    }
    const { notes, symptoms, side_effects, missed_doses, next_visit_date } = req.body;

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        notes,
        symptoms:      symptoms || [],
        sideEffects:   side_effects || [],
        missedDoses:   missed_doses,
        nextVisitDate: next_visit_date ? new Date(next_visit_date) : undefined,
      },
    });

    res.json({ success: true, message: 'Visit updated', data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update visit', error: String(error) });
  }
};