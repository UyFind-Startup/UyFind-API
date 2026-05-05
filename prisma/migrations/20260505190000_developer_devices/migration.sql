-- CreateTable
CREATE TABLE "developer_devices" (
    "id" SERIAL NOT NULL,
    "developer_id" INTEGER NOT NULL,
    "expo_push_token" TEXT NOT NULL,
    "platform" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_devices_expo_push_token_key" ON "developer_devices"("expo_push_token");

-- CreateIndex
CREATE INDEX "developer_devices_developer_id_idx" ON "developer_devices"("developer_id");

-- AddForeignKey
ALTER TABLE "developer_devices" ADD CONSTRAINT "developer_devices_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

