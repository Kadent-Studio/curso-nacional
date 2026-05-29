import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

function addDays(days: number, hour = 18): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@curso-nacional.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  const operatorEmail = process.env.SEED_OPERATOR_EMAIL ?? "operator@curso-nacional.local";
  const operatorPassword = process.env.SEED_OPERATOR_PASSWORD ?? "operator1234";

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash: await hash(adminPassword),
      name: "Administrador",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: operatorEmail.toLowerCase() },
    update: {},
    create: {
      email: operatorEmail.toLowerCase(),
      passwordHash: await hash(operatorPassword),
      name: "Operador",
      role: "OPERATOR",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { kind: "BS" },
    update: {},
    create: {
      kind: "BS",
      label: "Pago Móvil / Transferencia (Bs.)",
      instructions:
        "Banco: Banco Demo\nTitular: Curso Nacional, C.A.\nCédula/RIF: J-00000000-0\nTeléfono: 0414-0000000\nMonto exacto en Bs. según tasa vigente.",
      active: true,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { kind: "USDT" },
    update: {},
    create: {
      kind: "USDT",
      label: "USDT (Binance Pay / TRC-20)",
      instructions:
        "Red: TRC-20\nDirección: TDEMO0000000000000000000000000000\nID Binance: cursonacional\nEnvía el monto exacto en USDT y sube el comprobante.",
      active: true,
    },
  });

  const existingRate = await prisma.exchangeRate.findFirst({ where: { active: true } });
  if (!existingRate) {
    await prisma.exchangeRate.create({
      data: { bsPerUsd: new Prisma.Decimal("36.5000"), active: true },
    });
  }

  // Taller presencial estilo "Caracas: Alibaba, Binance y Shein"
  await prisma.event.upsert({
    where: { slug: "caracas-alibaba-binance-shein" },
    update: {},
    create: {
      slug: "caracas-alibaba-binance-shein",
      title: "Caracas · Alibaba, Binance y Shein",
      summary:
        "Un día de taller en sala para aprender a importar, vender y mover dinero entre plataformas — sin perderte por el camino.",
      description:
        "Taller presencial de un día completo en Caracas. Trabajamos cómo abrir cuenta en Alibaba, hacer un primer pedido seguro, vender por Shein, mover el dinero por Binance P2P y cerrar la operación en bolívares o USDT. Cupo limitado por sala. Incluye material impreso y un mes en el grupo privado de seguimiento.",
      type: "THEATER",
      modality: "IN_PERSON",
      status: "PUBLISHED",
      location: "Caracas — Sede del curso (dirección al confirmar)",
      reservationTtlMin: 20,
      featured: true,
      occurrences: {
        create: [
          { startsAt: addDays(14, 9), capacity: 60 },
          { startsAt: addDays(35, 9), capacity: 60 },
        ],
      },
      priceVariants: {
        create: [
          { name: "General", priceUsd: new Prisma.Decimal("80.00"), sortOrder: 1 },
          { name: "Pronto-pago", priceUsd: new Prisma.Decimal("60.00"), sortOrder: 2 },
        ],
      },
    },
  });

  // Serie de economía por WhatsApp
  await prisma.event.upsert({
    where: { slug: "serie-economia-explicada" },
    update: {},
    create: {
      slug: "serie-economia-explicada",
      title: "Serie: economía explicada en cristiano",
      summary:
        "Cinco módulos para entender de verdad cómo funciona el dinero. Por WhatsApp, a tu ritmo, con grupo privado y devoluciones por audio.",
      description:
        "Programa de cinco módulos sobre oferta y demanda, criptomonedas, exportación, economía emocional y capitalismo. Las clases llegan a un grupo de WhatsApp solo de tu cohorte, con audios, materiales descargables y horarios fijos de consulta. No es un curso para repetir frases; es para que entiendas, decidas mejor y empieces a moverte.",
      type: "COURSE",
      modality: "ONLINE",
      status: "PUBLISHED",
      reservationTtlMin: 60 * 24,
      featured: true,
      occurrences: {
        create: [
          { startsAt: addDays(7, 19), capacity: 200 },
          { startsAt: addDays(38, 19), capacity: 200 },
        ],
      },
      priceVariants: {
        create: [
          { name: "Acceso completo", priceUsd: new Prisma.Decimal("65.00"), sortOrder: 1 },
          { name: "Estudiante", priceUsd: new Prisma.Decimal("45.00"), sortOrder: 2 },
        ],
      },
    },
  });

  // Curso por WhatsApp más específico
  await prisma.event.upsert({
    where: { slug: "curso-exportacion-desde-venezuela" },
    update: {},
    create: {
      slug: "curso-exportacion-desde-venezuela",
      title: "Curso: cómo exportar desde Venezuela",
      summary:
        "Cuatro semanas por WhatsApp para sacar un producto al mundo: trámites, costos, logística y casos reales.",
      description:
        "Curso intensivo de cuatro semanas dictado por WhatsApp. Cubrimos clasificación arancelaria, certificaciones básicas, costos reales, primeros envíos por courier y comercio formal, cobro en divisas y casos de exportadores venezolanos. Grupo privado, dos sesiones en vivo por semana y material descargable.",
      type: "COURSE",
      modality: "ONLINE",
      status: "PUBLISHED",
      reservationTtlMin: 60 * 24,
      occurrences: {
        create: [{ startsAt: addDays(21, 19), capacity: 120 }],
      },
      priceVariants: {
        create: [
          { name: "General", priceUsd: new Prisma.Decimal("120.00"), sortOrder: 1 },
          { name: "Pronto-pago", priceUsd: new Prisma.Decimal("95.00"), sortOrder: 2 },
        ],
      },
    },
  });

  console.log("Seed completo.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
