-- Блок/корпус для группировки на шахматке; уникальность номера в паре (проект, блок, номер).
ALTER TABLE "apartments" ADD COLUMN IF NOT EXISTS "section_key" TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS "apartments_project_id_number_key";

CREATE UNIQUE INDEX "apartments_project_id_section_key_number_key"
ON "apartments"("project_id", "section_key", "number");
