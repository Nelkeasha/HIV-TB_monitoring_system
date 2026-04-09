import { z } from "zod";

export const createPatientSchema = z.object({
  national_id: z
    .string()
    .min(10, "National ID must be at least 10 characters")
    .optional(),

  first_name: z
    .string({ message: "First name is required" })
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),

  last_name: z
    .string({ message: "Last name is required" })
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),

  date_of_birth: z
    .string({ message: "Date of birth is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),

  gender: z.enum(["male", "female", "other"] as const, {
    message: "Gender is required",
  }),

  phone: z
    .string()
    .regex(/^[0-9+]{10,15}$/, "Invalid phone number")
    .optional(),

  address: z
    .string({ message: "Address is required" })
    .min(5, "Address must be at least 5 characters"),

  disease_type: z.enum(["HIV", "TB", "HIV_TB"] as const, {
    message: "Disease type is required",
  }),

  art_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ART start date must be in YYYY-MM-DD format")
    .optional(),

  tb_treatment_start_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "TB treatment date must be in YYYY-MM-DD format",
    )
    .optional(),

  facility_id: z.string().uuid("Invalid facility ID").optional(),
});

export const updatePatientSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9+]{10,15}$/, "Invalid phone number")
    .optional(),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional(),

  art_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ART start date must be in YYYY-MM-DD format")
    .optional(),

  tb_treatment_start_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "TB treatment date must be in YYYY-MM-DD format",
    )
    .optional(),
});
