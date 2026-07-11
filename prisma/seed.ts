import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catálogo vacío a propósito: los demos se vuelven a publicar
 * solo cuando haya un cuento nuevo listo (docs/roadmap.md).
 */
async function main() {
  const deleted = await prisma.story.deleteMany({});
  console.log(`✓ Cleared story catalog (${deleted.count} rows removed)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
