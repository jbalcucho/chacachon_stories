import { PrismaClient, StoryStatus, StoryVariant } from "@prisma/client";

const prisma = new PrismaClient();

/** Corpus semilla curado — Fase 2 del plan de trabajo (docs/plan-trabajo-chacachon.md). */
const STORIES = [
  {
    slug: "valentina-el-valle-de-los-susurros",
    title: "Valentina y la linterna del Valle de los Susurros",
    description: "Una noche para encontrar el camino de vuelta a casa",
    moraleja: "calma",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 1,
  },
  {
    slug: "samuel-el-sendero-de-las-luciernagas",
    title: "Samuel y el Sendero de las Luciérnagas",
    description: "El farolero de los destellos en la finca",
    moraleja: "valentía",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 2,
  },
  {
    slug: "isabella-el-valle-de-los-ecos",
    title: "El Valle de los Ecos Perdidos",
    description: "Un reino donde las miradas se quedan atrapadas",
    moraleja: "respeto",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 3,
  },
  {
    slug: "tomas-el-espejo-de-los-ecos",
    title: "Tomás y el Espejo de los Ecos",
    description: "Un farol necesita manos amigas, no luces de bolsillo",
    moraleja: "paciencia",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 4,
  },
  {
    slug: "manuela-el-banquete-del-valle-colorido",
    title: "El banquete del Valle Colorido",
    description: "Una aventura llena de sabores mágicos",
    moraleja: "alegría",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 5,
  },
  {
    slug: "andres-el-reino-de-las-hortalizas",
    title: "El Reino de las Hortalizas Gigantes",
    description: "La misión de Andrés en la huerta del abuelo",
    moraleja: "honestidad",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 6,
  },
  {
    slug: "camila-el-valle-de-los-bolos-saltarines",
    title: "El Valle de los Bolos Saltarines",
    description: "Un tesoro que solo brilla cuando se reparte",
    moraleja: "generosidad",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 7,
  },
  {
    slug: "emiliano-el-guardian-de-la-ciudad-zigzag",
    title: "El Guardián de la Ciudad Zigzag",
    description: "Donde las piezas encajan mejor cuando se prestan",
    moraleja: "respeto",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 8,
  },
  {
    slug: "luciana-el-reino-de-las-piezas-perdidas",
    title: "El Reino de las Piezas Perdidas",
    description: "Un mundo donde cada ladrillo es un tesoro",
    moraleja: "responsabilidad",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 9,
  },
  {
    slug: "joaquin-el-rincon-oscuro",
    title: "El Caballero de la Linterna Reluciente",
    description: "Un viaje al Reino del Rincón Oscuro",
    moraleja: "valentía",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 10,
  },
  {
    slug: "cerditos-la-torre-bien-hecha",
    title: "La Fortaleza de los Mil Bloques",
    description: "Donde cada pieza tiene su lugar bajo el sol",
    moraleja: "responsabilidad",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 11,
  },
  {
    slug: "caperucita-el-camino-del-mandado",
    title: "El secreto de la Sopa de Estrellas",
    description: "Una travesía por el Bosque del Rumor",
    moraleja: "respeto",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 12,
  },
  {
    slug: "ricitos-las-cosas-prestadas",
    title: "La Vereda de las Mil Delicias",
    description: "Un festín para los que saben pedir permiso",
    moraleja: "respeto",
    accentCode: "neutro",
    variant: StoryVariant.NARRATIVE,
    status: StoryStatus.PUBLISHED,
    familyTag: "chacachon",
    sortOrder: 13,
  },
];

async function main() {
  const deleted = await prisma.story.deleteMany({});
  console.log(`✓ Cleared story catalog (${deleted.count} rows removed)`);

  for (const story of STORIES) {
    await prisma.story.create({ data: { ...story, publishedAt: new Date() } });
  }
  console.log(`✓ Seeded ${STORIES.length} published stories`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
