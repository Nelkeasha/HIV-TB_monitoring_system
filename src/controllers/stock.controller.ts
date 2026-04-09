import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createFhirMedicationDispense } from '../services/fhir.service';

export const addStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      medication_name,
      quantity,
      unit,
      low_stock_threshold,
      expiry_date,
    } = req.body;

    const chwId = req.user!.userId;

    // Check if medication already exists for this CHW
    const existing = await prisma.medicationStock.findUnique({
      where: {
        chwId_medicationName: {
          chwId:          chwId,
          medicationName: medication_name,
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `${medication_name} already exists. Use the update endpoint to change quantity.`,
      });
      return;
    }

    const stock = await prisma.medicationStock.create({
      data: {
        chwId:            chwId,
        medicationName:   medication_name,
        quantity:         quantity,
        unit:             unit,
        lowStockThreshold: low_stock_threshold || 10,
        expiryDate:       expiry_date ? new Date(expiry_date) : null,
      },
    });

    const isLow = stock.quantity <= stock.lowStockThreshold;

    res.status(201).json({
      success: true,
      message: 'Medication added to stock',
      data: {
        stock,
        low_stock_alert: isLow,
        alert_message:   isLow ? `⚠️ ${medication_name} is already below threshold.` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add stock', error: String(error) });
  }
};

export const getMyStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const chwId = req.user!.userId;

    const stock = await prisma.medicationStock.findMany({
      where:   { chwId },
      orderBy: { medicationName: 'asc' },
    });

    // Separate low stock items
    const lowStockItems  = stock.filter(s => s.quantity <= s.lowStockThreshold);
    const normalItems    = stock.filter(s => s.quantity > s.lowStockThreshold);

    // Check for expiring soon (within 30 days)
    const today         = new Date();
    const in30Days      = new Date();
    in30Days.setDate(today.getDate() + 30);

    const expiringItems = stock.filter(s =>
      s.expiryDate && s.expiryDate <= in30Days && s.expiryDate >= today
    );

    res.json({
      success: true,
      message: 'Stock fetched',
      data: {
        summary: {
          total_medications:  stock.length,
          low_stock_count:    lowStockItems.length,
          expiring_soon:      expiringItems.length,
        },
        low_stock_alerts:   lowStockItems,
        expiring_alerts:    expiringItems,
        stock:              normalItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stock', error: String(error) });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }                                          = req.params;
    const { quantity, low_stock_threshold, expiry_date } = req.body;

    const chwId = req.user!.userId;

    // Make sure this stock belongs to this CHW
    const existing = await prisma.medicationStock.findUnique({ where: { id: id as string } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Stock item not found' });
      return;
    }

    if (existing.chwId !== chwId) {
      res.status(403).json({ success: false, message: 'You can only update your own stock' });
      return;
    }

    const stock = await prisma.medicationStock.update({
      where: { id: id as string },
      data: {
        quantity:          quantity          ?? existing.quantity,
        lowStockThreshold: low_stock_threshold ?? existing.lowStockThreshold,
        expiryDate:        expiry_date ? new Date(expiry_date) : existing.expiryDate,
      },
    });

    

  

    const isLow = stock.quantity <= stock.lowStockThreshold;

    res.json({
      success: true,
      message: 'Stock updated',
      data: {
        stock,
        low_stock_alert: isLow,
        alert_message:   isLow
          ? `⚠️ ${stock.medicationName} is running low. Only ${stock.quantity} ${stock.unit} remaining.`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock', error: String(error) });
  }
};

export const dispenseStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }              = req.params;
    const { quantity_given }  = req.body;

    const chwId = req.user!.userId;

    const existing = await prisma.medicationStock.findUnique({ where: { id: id as string } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Stock item not found' });
      return;
    }

    if (existing.chwId !== chwId) {
      res.status(403).json({ success: false, message: 'You can only dispense from your own stock' });
      return;
    }

    // Check enough stock available
    if (quantity_given > existing.quantity) {
      res.status(400).json({
        success: false,
        message: `Not enough stock. Only ${existing.quantity} ${existing.unit} available.`,
      });
      return;
    }

    const newQuantity = existing.quantity - quantity_given;

    const stock = await prisma.medicationStock.update({
      where: { id: id as string },
      data:  { quantity: newQuantity },
    });

    try {
      const chw = await prisma.user.findUnique({
        where: { id: chwId },
        select: { name: true },
      });

      // Get any patient linked to this CHW to reference in FHIR
      const patient = await prisma.patient.findFirst({
        where: { assignedChwId: chwId, isActive: true },
        select: { fhirId: true },
      });

      if (patient?.fhirId) {
        await createFhirMedicationDispense({
          fhirPatientId: patient.fhirId,
          medicationName: existing.medicationName,
          quantity: quantity_given,
          unit: existing.unit,
          dispensedBy: chw?.name || "CHW",
        });
      }
    } catch (fhirError) {
      console.warn("FHIR dispense sync failed:", fhirError);
    }

    const isLow = stock.quantity <= stock.lowStockThreshold;

    res.json({
      success: true,
      message: `Dispensed ${quantity_given} ${stock.unit} of ${stock.medicationName}`,
      data: {
        stock,
        remaining:       newQuantity,
        low_stock_alert: isLow,
        alert_message:   isLow
          ? `⚠️ ${stock.medicationName} is running low. Only ${newQuantity} ${stock.unit} remaining.`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to dispense stock', error: String(error) });
  }
};

export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }   = req.params;
    const chwId    = req.user!.userId;

    const existing = await prisma.medicationStock.findUnique({ where: { id: id as string } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Stock item not found' });
      return;
    }

    if (existing.chwId !== chwId) {
      res.status(403).json({ success: false, message: 'You can only delete your own stock' });
      return;
    }

    await prisma.medicationStock.delete({ where: { id: id as string } });

    res.json({ success: true, message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete stock', error: String(error) });
  }
};