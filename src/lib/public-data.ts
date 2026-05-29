import { prisma } from "@/src/lib/db";
import { expireStale } from "@/src/lib/reservations";
import type { EventCardData } from "@/src/components/event-card";

const BLOCKING = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"] as const;

export type OccurrenceAvailability = {
  id: string;
  startsAt: Date;
  endsAt: Date | null;
  capacity: number;
  status: "SCHEDULED" | "CANCELLED" | "SOLD_OUT";
  booked: number;
  available: number;
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[public-data] DB query failed, returning fallback.", err);
    }
    return fallback;
  }
}

export async function getUpcomingEvents(limit = 6): Promise<EventCardData[]> {
  return safe(async () => {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      include: {
        occurrences: {
          where: { status: "SCHEDULED", startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 1,
        },
        priceVariants: {
          where: { active: true },
          orderBy: { priceUsd: "asc" },
          take: 1,
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return events.map((e): EventCardData => ({
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      type: e.type,
      modality: e.modality,
      location: e.location,
      imagePath: e.imagePath,
      nextDate: e.occurrences[0]?.startsAt ?? null,
      fromPriceUsd: e.priceVariants[0] ? Number(e.priceVariants[0].priceUsd) : null,
    }));
  }, []);
}

export async function getEventBySlug(slug: string) {
  return safe(async () => {
    await expireStale().catch(() => {});
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        occurrences: {
          where: { status: "SCHEDULED" },
          orderBy: { startsAt: "asc" },
        },
        priceVariants: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!event) return null;

    const occIds = event.occurrences.map((o) => o.id);
    const bookedRows =
      occIds.length === 0
        ? []
        : await prisma.reservationItem.groupBy({
            by: ["occurrenceId"],
            where: {
              occurrenceId: { in: occIds },
              reservation: { status: { in: BLOCKING as unknown as ("PENDING_PAYMENT" | "PAYMENT_REVIEW" | "CONFIRMED")[] } },
            },
            _sum: { quantity: true },
          });
    const bookedByOcc = new Map(bookedRows.map((r) => [r.occurrenceId, r._sum.quantity ?? 0]));

    const occurrencesWithAvailability: OccurrenceAvailability[] = event.occurrences.map((o) => {
      const booked = bookedByOcc.get(o.id) ?? 0;
      const available = Math.max(0, o.capacity - booked);
      return {
        id: o.id,
        startsAt: o.startsAt,
        endsAt: o.endsAt,
        capacity: o.capacity,
        status: o.status,
        booked,
        available,
      };
    });

    return { ...event, occurrences: occurrencesWithAvailability };
  }, null);
}

export async function getReservationByCode(code: string) {
  return safe(async () => {
    return prisma.reservation.findUnique({
      where: { code },
      include: {
        event: true,
        items: {
          include: {
            occurrence: true,
            priceVariant: true,
          },
        },
      },
    });
  }, null);
}

export async function getActivePaymentMethods() {
  return safe(async () => {
    return prisma.paymentMethod.findMany({
      where: { active: true },
      orderBy: { kind: "asc" },
    });
  }, []);
}

export async function getCurrentExchangeRate() {
  return safe(async () => {
    return prisma.exchangeRate.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }, null);
}
