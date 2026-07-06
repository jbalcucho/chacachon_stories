-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "StoryVariant" AS ENUM ('NARRATIVE', 'APARTMENT', 'PILOT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "family_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "perfil" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "moraleja" TEXT,
    "family_tag" TEXT,
    "accent_code" TEXT NOT NULL DEFAULT 'bogota_ninos',
    "html_path" TEXT,
    "variant" "StoryVariant" NOT NULL DEFAULT 'NARRATIVE',
    "status" "StoryStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "family_profiles_user_id_key" ON "family_profiles"("user_id");
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");
CREATE INDEX "stories_status_sort_order_idx" ON "stories"("status", "sort_order");

-- AddForeignKey
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
