-- Extend LeadStatus (PostgreSQL: additive enum values)
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'MEETING';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'RESERVED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'SOLD';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'CANCELED';

-- New enums
CREATE TYPE "ApartmentStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');
CREATE TYPE "CustomerPaymentType" AS ENUM ('DEPOSIT', 'INSTALLMENT', 'FULL', 'OTHER');
CREATE TYPE "ConstructionStageKey" AS ENUM ('FOUNDATION', 'FRAME', 'FACADE', 'INTERIOR', 'LANDSCAPING');

-- Apartments (chessboard units)
CREATE TABLE "apartments" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "area_sqm" DOUBLE PRECISION NOT NULL,
    "price_uzs" INTEGER,
    "status" "ApartmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "layout_image_url" TEXT,
    "model_3d_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "apartments_project_id_number_key" ON "apartments"("project_id", "number");
CREATE INDEX "apartments_project_id_floor_idx" ON "apartments"("project_id", "floor");
CREATE INDEX "apartments_project_id_status_idx" ON "apartments"("project_id", "status");

ALTER TABLE "apartments" ADD CONSTRAINT "apartments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leads → apartment (optional)
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "apartment_id" INTEGER;

CREATE INDEX IF NOT EXISTS "leads_apartment_id_idx" ON "leads"("apartment_id");

ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_apartment_id_fkey";
ALTER TABLE "leads" ADD CONSTRAINT "leads_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Building progress (per project)
CREATE TABLE "building_progress" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "percent_complete" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "building_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "building_progress_project_id_key" ON "building_progress"("project_id");

ALTER TABLE "building_progress" ADD CONSTRAINT "building_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "construction_stages" (
    "id" SERIAL NOT NULL,
    "building_progress_id" INTEGER NOT NULL,
    "stage_key" "ConstructionStageKey" NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "construction_stages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "construction_stages_building_progress_id_stage_key_key" ON "construction_stages"("building_progress_id", "stage_key");
CREATE INDEX "construction_stages_building_progress_id_idx" ON "construction_stages"("building_progress_id");

ALTER TABLE "construction_stages" ADD CONSTRAINT "construction_stages_building_progress_id_fkey" FOREIGN KEY ("building_progress_id") REFERENCES "building_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Customers & cabinet
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "apartment_id" INTEGER,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "access_code" TEXT NOT NULL,
    "verification_token" TEXT,
    "total_price_uzs" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customers_access_code_key" ON "customers"("access_code");
CREATE UNIQUE INDEX "customers_verification_token_key" ON "customers"("verification_token");
CREATE INDEX "customers_project_id_idx" ON "customers"("project_id");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

ALTER TABLE "customers" ADD CONSTRAINT "customers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "customer_sessions" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customer_sessions_token_key" ON "customer_sessions"("token");
CREATE INDEX "customer_sessions_customer_id_idx" ON "customer_sessions"("customer_id");

ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "customer_payments" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "amount_uzs" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "type" "CustomerPaymentType" NOT NULL DEFAULT 'OTHER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customer_payments_customer_id_idx" ON "customer_payments"("customer_id");

ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "customer_documents" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "is_contract" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customer_documents_customer_id_idx" ON "customer_documents"("customer_id");

ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
