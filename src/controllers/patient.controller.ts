import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
        nationalId     = req.body.national_id,
        firstName      = req.body.first_name,
        lastName       = req.body.last_name,
        dateOfBirth    = req.body.date_of_birth,
        gender,
        phone,
        address,
        diseaseType    = req.body.disease_type,
        artStartDate   = req.body.art_start_date,
        tbTreatmentStartDate = req.body.tb_treatment_start_date,
        facilityId     = req.body.facility_id,
    } = req.body;

    const chwId = req.user!.userId;

    if (nationalId) {
      const existing = await prisma.patient.findUnique({ where: { nationalId } });
      if (existing) {
        res.status(409).json({ success: false, message: 'Patient with this national ID already exists' });
        return;
      }
    }

    const patient = await prisma.patient.create({
      data: {
        nationalId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        address,
        diseaseType,
        artStartDate: artStartDate ? new Date(artStartDate) : null,
        tbTreatmentStartDate: tbTreatmentStartDate ? new Date(tbTreatmentStartDate) : null,
        assignedChwId: chwId,
        facilityId,
      },
    });

    res.status(201).json({ success: true, message: 'Patient registered', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register patient', error: String(error) });
  }
};

export const getPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { diseaseType, search } = req.query;

    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        ...(role === 'chw' && { assignedChwId: userId }),
        ...(diseaseType && { diseaseType: diseaseType as any }),
        ...(search && {
          OR: [
            { firstName: { contains: String(search), mode: 'insensitive' } },
            { lastName: { contains: String(search), mode: 'insensitive' } },
            { nationalId: { contains: String(search), mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        assignedChw: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, message: 'Patients fetched', data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patients', error: String(error) });
  }
};

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: id as string },
      include: {
        assignedChw: { select: { id: true, name: true, email: true } },
        visits: { orderBy: { visitDate: 'desc' }, take: 5 },
        adherenceRecords: { orderBy: { recordDate: 'desc' }, take: 3 },
      },
    });

    if (!patient || !patient.isActive) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    res.json({ success: true, message: 'Patient fetched', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patient', error: String(error) });
  }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { phone, address, artStartDate, tbTreatmentStartDate } = req.body;

    const patient = await prisma.patient.update({
      where: { id: id as string },
      data: {
        phone,
        address,
        artStartDate: artStartDate ? new Date(artStartDate) : undefined,
        tbTreatmentStartDate: tbTreatmentStartDate ? new Date(tbTreatmentStartDate) : undefined,
      },
    });

    res.json({ success: true, message: 'Patient updated', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update patient', error: String(error) });
  }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.patient.update({
      where: { id: id as string },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Patient deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate patient', error: String(error) });
  }
};