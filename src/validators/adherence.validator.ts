import { z } from "zod";

export const recordAdherenceSchema = z.object({
  patient_id: z
    .string({ message: "Patient ID is required" })
    .uuid("Invalid patient ID"),

  record_date: z
    .string({ message: "Record date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Record date must be in YYYY-MM-DD format"),

  doses_taken: z
    .number({ message: "Doses taken is required" })
    .int("Doses taken must be a whole number")
    .min(0, "Doses taken cannot be negative"),

  doses_prescribed: z
    .number({ message: "Doses prescribed is required" })
    .int("Doses prescribed must be a whole number")
    .min(1, "Doses prescribed must be at least 1"),
});
