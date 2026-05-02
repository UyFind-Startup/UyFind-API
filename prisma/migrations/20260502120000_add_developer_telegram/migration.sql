-- AlterTable
ALTER TABLE "developers" ADD COLUMN     "telegram_chat_id" TEXT,
ADD COLUMN     "telegram_link_token" TEXT,
ADD COLUMN     "telegram_link_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "developers_telegram_link_token_key" ON "developers"("telegram_link_token");
