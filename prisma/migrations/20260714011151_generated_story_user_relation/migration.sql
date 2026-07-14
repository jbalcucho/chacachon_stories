-- AddForeignKey
ALTER TABLE "generated_stories" ADD CONSTRAINT "generated_stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
