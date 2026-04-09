import { z } from "zod";

export const addStockSchema = z.object({
  medication_name: z
    .string({ message: "Medication name is required" })
    .min(2, "Medication name must be at least 2 characters")
    .max(100, "Medication name cannot exceed 100 characters"),

  quantity: z
    .number({ message: "Quantity is required" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),

  unit: z.string({ message: "Unit is required" }).min(1, "Unit is required"),

  low_stock_threshold: z
    .number()
    .int("Threshold must be a whole number")
    .min(1, "Threshold must be at least 1")
    .optional(),

  expiry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .optional(),
});

export const dispenseStockSchema = z.object({
  quantity_given: z
    .number({ message: "Quantity given is required" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});
