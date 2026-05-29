import { prisma } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { expireStale } from "@/src/lib/reservations";

export type DashboardStats = {
  pendingPayment: number;
  paymentReview: number;
  confirmed: number;
  expired: number;
  rejected: number;
  cancelled: number;
  estimatedRevenueUsd: number;
  activeEvents: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await expireStale().catch(() => {});

  const [grouped, revenue, activeEvents] = await Promise.all([
    prisma.reservation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.reservation.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amountUsd: true },
    }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
  ]);

  const byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));

  return {
    pendingPayment: byStatus["PENDING_PAYMENT"] ?? 0,
    paymentReview: byStatus["PAYMENT_REVIEW"] ?? 0,
    confirmed: byStatus["CONFIRMED"] ?? 0,
    expired: byStatus["EXPIRED"] ?? 0,
    rejected: byStatus["REJECTED"] ?? 0,
    cancelled: byStatus["CANCELLED"] ?? 0,
    estimatedRevenueUsd: revenue._sum.amountUsd ? Number(revenue._sum.amountUsd) : 0,
    activeEvents,
  };
}

export async function getRecentReservations(limit = 8) {
  return prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { event: { select: { title: true, slug: true } } },
  });
}

export type ReservationFilters = {
  status?: string;
  search?: string;
  eventId?: string;
  kind?: "COURSE" | "THEATER";
};

export async function listReservations(filters: ReservationFilters) {
  await expireStale().catch(() => {});
  const where: Prisma.ReservationWhereInput = {};
  if (filters.status) where.status = filters.status as Prisma.EnumReservationStatusFilter["equals"];
  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.kind) where.event = { type: filters.kind };
  if (filters.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { buyerFirstName: { contains: filters.search, mode: "insensitive" } },
      { buyerLastName: { contains: filters.search, mode: "insensitive" } },
      { buyerWhatsapp: { contains: filters.search } },
    ];
  }
  return prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      event: { select: { title: true, slug: true, type: true } },
    },
  });
}

export async function listActiveEvents(kind?: "COURSE" | "THEATER") {
  return prisma.event.findMany({
    where: {
      status: { not: "ARCHIVED" },
      ...(kind ? { type: kind } : {}),
    },
    orderBy: [{ status: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      _count: { select: { reservations: true } },
    },
  });
}

export async function getReservationAdmin(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      event: true,
      items: { include: { occurrence: true, priceVariant: true } },
    },
  });
}

export async function listAdminEvents() {
  return prisma.event.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { reservations: true, occurrences: true } },
    },
  });
}

export async function getEventAdmin(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      occurrences: { orderBy: { startsAt: "asc" } },
      priceVariants: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getPaymentMethodsAdmin() {
  return prisma.paymentMethod.findMany({ orderBy: { kind: "asc" } });
}

export async function getExchangeRateHistory(limit = 20) {
  return prisma.exchangeRate.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
