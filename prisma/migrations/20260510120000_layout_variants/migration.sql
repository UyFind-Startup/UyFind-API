-- Layout variants (template = one project_floor_layout row + optional 3D URL for CRM/шахматка)
CREATE TABLE "layout_variants" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "project_floor_layout_id" INTEGER NOT NULL,
    "code" TEXT,
    "model_3d_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_variants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "layout_variants_project_floor_layout_id_key" ON "layout_variants"("project_floor_layout_id");
CREATE INDEX "layout_variants_project_id_idx" ON "layout_variants"("project_id");

ALTER TABLE "layout_variants" ADD CONSTRAINT "layout_variants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "layout_variants" ADD CONSTRAINT "layout_variants_project_floor_layout_id_fkey" FOREIGN KEY ("project_floor_layout_id") REFERENCES "project_floor_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Apartment units (existing table): link to layout variant + CRM JSON
ALTER TABLE "apartments" ADD COLUMN "layout_variant_id" INTEGER;
ALTER TABLE "apartments" ADD COLUMN "crm_metadata" JSONB;

CREATE INDEX "apartments_layout_variant_id_idx" ON "apartments"("layout_variant_id");

ALTER TABLE "apartments" ADD CONSTRAINT "apartments_layout_variant_id_fkey" FOREIGN KEY ("layout_variant_id") REFERENCES "layout_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
