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
    htmlPath: "/cuentos/familia-chacachon-operacion-a-dormir.html",
    variant: StoryVariant.APARTMENT,
    status: StoryStatus.PUBLISHED,
    sortOrder: 3,
    publishedAt: new Date("2026-07-08"),
  },
  {
    slug: "el-ascensor-de-las-sorpresas",
    title: "El ascensor de las sorpresas",
    description:
      "Piso 11, botón equivocado y un viaje inesperado con Betty y Bingo en el edificio.",
    moraleja: "En el edificio también se aprende a esperar con paciencia.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: StoryVariant.APARTMENT,
    status: StoryStatus.DRAFT,
    sortOrder: 4,
    publishedAt: null,
  },
  {
    slug: "pauleta-y-el-tren-del-bosque",
    title: "Pauleta y el tren del bosque",
    description:
      "De la vereda al bosque de eucaliptos en un tren de fantasía con olor a tierra mojada.",
    moraleja: "La imaginación abre caminos cuando el camino se pone largo.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.DRAFT,
    sortOrder: 5,
    publishedAt: null,
  },
  {
    slug: "mision-mercado-paloquemao",
    title: "Misión en Paloquemao",
    description:
      "Lista de compras, frutas de colores y un desafío entre pasillos con mamá y papá.",
    moraleja: "Ayudar en casa también puede ser una aventura en familia.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.DRAFT,
    sortOrder: 6,
    publishedAt: null,
  },
  {
    slug: "nico-dia-sin-pantallas",
    title: "El día sin pantallas de Nico",
    description:
      "Un domingo en Chapinero sin tablet: Legos, charcos, columpios y una familia que se mira de verdad.",
    moraleja:
      "Desconectarse un rato deja espacio para jugar juntos… y para verse de verdad.",
    familyTag: "chacachon",
    htmlPath: "/cuentos/familia-chacachon-nico-dia-sin-pantallas.html",
    variant: StoryVariant.APARTMENT,
    status: StoryStatus.PUBLISHED,
    sortOrder: 7,
    publishedAt: new Date("2026-07-08"),
  },
  {
    slug: "chacachon-en-la-luna",
    title: "Chacachón en la luna",
    description:
      "Cuento piloto: la familia imagina un viaje nocturno más allá de Bogotá.",
    moraleja: "Soñar en voz alta también es leer un cuento.",
    familyTag: "chacachon",
    htmlPath: null,
    variant: StoryVariant.PILOT,
    status: StoryStatus.DRAFT,
    sortOrder: 8,
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
