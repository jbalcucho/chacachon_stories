-- CreateTable
CREATE TABLE "generated_stories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "recipe" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'mock',
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_stories_user_id_created_at_idx" ON "generated_stories"("user_id", "created_at");
