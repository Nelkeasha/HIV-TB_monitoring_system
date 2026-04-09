import { z } from "zod";

export const createVisitSchema = z.object({
  patient_id: z
    .string({ message: "Patient ID is required" })
    .uuid("Invalid patient ID"),

  visit_date: z
    .string({ message: "Visit date is required" })
    .datetime("Visit date must be a valid datetime"),

  visit_type: z.enum(["home_visit", "facility_visit", "phone_call"] as const, {
    message: "Visit type is required",
  }),

  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),

  symptoms: z.array(z.string()).optional(),

  side_effects: z.array(z.string()).optional(),

  missed_doses: z
    .number()
    .int("Missed doses must be a whole number")
    .min(0, "Missed doses cannot be negative")
    .optional(),

  next_visit_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Next visit date must be in YYYY-MM-DD format",
    )
    .optional(),
});
