import { PrismaClient, StoryStatus, StoryVariant } from "@prisma/client";

const prisma = new PrismaClient();

const stories = [
  {
    slug: "el-lobo-y-las-palabras",
    title: "El lobo de las palabras feas",
    description:
      "Vereda, bosque de eucaliptos y tres casitas. Bingo es el lobo, Betty la abuelita. Pauleta va con su capa roja por el sendero.",
    moraleja: "Cuidar las palabras y no contestarle feo a mamá y papá.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-el-lobo-y-las-palabras.html",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    sortOrder: 1,
    publishedAt: new Date("2026-06-01"),
  },
  {
    slug: "cerditos-del-edificio",
    title: "Los Tres Cerditos del Edificio",
    description:
      "Misma moraleja, pero en el apartamento: ascensor, mismo piso que la abuelita Betty, y Bingo ladrando en el pasillo.",
    moraleja:
      "Las palabras feas alimentan al lobo; el respeto protege la casa.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-cerditos-caperucita.html",
    variant: StoryVariant.APARTMENT,
    status: StoryStatus.PUBLISHED,
    sortOrder: 2,
    publishedAt: new Date("2026-06-01"),
  },
  {
    slug: "operacion-a-dormir",
    title: "Operación A Dormir",
    description:
      "El cuento de la hora de dormir con Nico, Simónchin, Josefina la aspiradora y toda la batalla nocturna del apartamento.",
    moraleja: "La rutina de noche: tablet, chanclas, chichi y la lista de Pauleta.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: StoryVariant.APARTMENT,
    status: StoryStatus.DRAFT,
    sortOrder: 3,
    publishedAt: null,
  },
  {
    slug: "balcutron-operacion-a-dormir",
    title: "Operación A Dormir (Balcutron)",
    description: "Cuento piloto espacial de la Familia Balcutron.",
    moraleja: "Apagar la tablet y dormir a tiempo.",
    familyTag: "balcutron",
    htmlPath: "/cuentos/familia-balcutron-operacion-a-dormir.html",
    variant: StoryVariant.PILOT,
    status: StoryStatus.PUBLISHED,
    sortOrder: 10,
    publishedAt: new Date("2026-05-01"),
  },
] as const;

async function main() {
  for (const story of stories) {
    await prisma.story.upsert({
      where: { slug: story.slug },
      create: story,
      update: story,
    });
  }

  console.log(`✓ Seeded ${stories.length} stories`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
