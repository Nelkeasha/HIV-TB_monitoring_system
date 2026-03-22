-- CreateEnum
CREATE TYPE "Role" AS ENUM ('chw', 'healthcare_provider', 'admin');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "DiseaseType" AS ENUM ('HIV', 'TB', 'HIV_TB');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('home_visit', 'facility_visit', 'phone_call');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "facility_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "national_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "disease_type" "DiseaseType" NOT NULL,
    "art_start_date" TIMESTAMP(3),
    "tb_treatment_start_date" TIMESTAMP(3),
    "assigned_chw_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "fhir_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "chw_id" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "visit_type" "VisitType" NOT NULL,
    "notes" TEXT,
    "symptoms" TEXT[],
    "side_effects" TEXT[],
    "missed_doses" INTEGER NOT NULL DEFAULT 0,
    "next_visit_date" TIMESTAMP(3),
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adherence_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "chw_id" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "doses_taken" INTEGER NOT NULL,
    "doses_prescribed" INTEGER NOT NULL,
    "adherence_percentage" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adherence_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_stock" (
    "id" TEXT NOT NULL,
    "chw_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "expiry_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_key" ON "patients"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "medication_stock_chw_id_medication_name_key" ON "medication_stock"("chw_id", "medication_name");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_assigned_chw_id_fkey" FOREIGN KEY ("assigned_chw_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_chw_id_fkey" FOREIGN KEY ("chw_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adherence_records" ADD CONSTRAINT "adherence_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adherence_records" ADD CONSTRAINT "adherence_records_chw_id_fkey" FOREIGN KEY ("chw_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_stock" ADD CONSTRAINT "medication_stock_chw_id_fkey" FOREIGN KEY ("chw_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
