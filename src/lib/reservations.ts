import { Prisma } from "@prisma/client";
import type {
  PaymentMethodKind,
  Reservation,
  ReservationStatus,
} from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { calculateAmount } from "@/src/lib/pricing";
import { formatReservationCode } from "@/src/lib/format";

const BLOCKING_STATUSES: ReservationStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"];

export type CreateReservationInput = {
  eventId: string;
  occurrenceId: string;
  priceVariantId: string;
  quantity: number;
  paymentMethodKind: PaymentMethodKind;
  buyer: {
    firstName: string;
    lastName: string;
    whatsapp: string;
    note?: string;
  };
};

export async function isReservationExpired(reservation: Pick<Reservation, "status" | "expiresAt">): Promise<boolean> {
  return reservation.status === "PENDING_PAYMENT" && reservation.expiresAt.getTime() < Date.now();
}

export async function expireStale(): Promise<number> {
  const now = new Date();
  const result = await prisma.reservation.updateMany({
    where: { status: "PENDING_PAYMENT", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

async function nextReservationCode(tx: Prisma.TransactionClient): Promise<string> {
  const counter = await tx.reservationCounter.upsert({
    where: { id: 1 },
    update: { value: { increment: 1 } },
    create: { id: 1, value: 1 },
  });
  return formatReservationCode(counter.value);
}

async function bookedQuantity(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
): Promise<number> {
  const agg = await tx.reservationItem.aggregate({
    where: {
      occurrenceId,
      reservation: { status: { in: BLOCKING_STATUSES } },
    },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  await expireStale();

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: input.eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    if (event.status !== "PUBLISHED") throw new Error("EVENT_NOT_AVAILABLE");

    const occurrence = await tx.eventOccurrence.findUnique({ where: { id: input.occurrenceId } });
    if (!occurrence || occurrence.eventId !== event.id) throw new Error("OCCURRENCE_NOT_FOUND");
    if (occurrence.status !== "SCHEDULED") throw new Error("OCCURRENCE_NOT_AVAILABLE");

    const variant = await tx.priceVariant.findUnique({ where: { id: input.priceVariantId } });
    if (!variant || variant.eventId !== event.id || !variant.active) {
      throw new Error("PRICE_VARIANT_NOT_AVAILABLE");
    }

    if (input.quantity < 1) throw new Error("INVALID_QUANTITY");

    const booked = await bookedQuantity(tx, occurrence.id);
    if (booked + input.quantity > occurrence.capacity) throw new Error("OVERBOOKING_BLOCKED");

    const amounts = await calculateAmount(
      [{ unitPriceUsd: variant.priceUsd as never, quantity: input.quantity }],
      input.paymentMethodKind,
    );

    const ttlMs = event.reservationTtlMin * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);
    const code = await nextReservationCode(tx);

    const reservation = await tx.reservation.create({
      data: {
        code,
        eventId: event.id,
        buyerFirstName: input.buyer.firstName,
        buyerLastName: input.buyer.lastName,
        buyerWhatsapp: input.buyer.whatsapp,
        buyerNote: input.buyer.note,
        status: "PENDING_PAYMENT",
        paymentMethodKind: input.paymentMethodKind,
        exchangeRate: amounts.exchangeRate ?? null,
        amountUsd: amounts.amountUsd,
        amountBs: amounts.amountBs ?? null,
        expiresAt,
        items: {
          create: [
            {
              occurrenceId: occurrence.id,
              priceVariantId: variant.id,
              quantity: input.quantity,
              unitPriceUsd: variant.priceUsd,
            },
          ],
        },
      },
    });

    return reservation;
  });
}

export async function attachReceipt(reservationId: string, receiptPath: string): Promise<Reservation> {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) throw new Error("RESERVATION_NOT_FOUND");
    if (reservation.status === "EXPIRED") throw new Error("RESERVATION_EXPIRED");
    if (reservation.status === "CANCELLED" || reservation.status === "REJECTED") {
      throw new Error("RESERVATION_CLOSED");
    }

    return tx.reservation.update({
      where: { id: reservation.id },
      data: {
        receiptPath,
        status: reservation.status === "PENDING_PAYMENT" ? "PAYMENT_REVIEW" : reservation.status,
      },
    });
  });
}

export async function confirmReservation(reservationId: string, internalNote?: string): Promise<Reservation> {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      internalNote: internalNote ?? undefined,
    },
  });
}

export async function rejectReservation(reservationId: string, internalNote?: string): Promise<Reservation> {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      internalNote: internalNote ?? undefined,
    },
  });
}

export async function cancelReservation(reservationId: string, internalNote?: string): Promise<Reservation> {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      internalNote: internalNote ?? undefined,
    },
  });
}

export async function checkInReservation(reservationId: string): Promise<Reservation> {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { items: true },
    });
    if (!reservation) throw new Error("RESERVATION_NOT_FOUND");
    if (reservation.status !== "CONFIRMED") throw new Error("RESERVATION_NOT_CONFIRMED");

    const totalQty = reservation.items.reduce((acc, it) => acc + it.quantity, 0);
    if (reservation.checkInsCount >= totalQty) throw new Error("TICKET_FULLY_USED");

    const now = new Date();
    return tx.reservation.update({
      where: { id: reservation.id },
      data: {
        checkInsCount: { increment: 1 },
        firstCheckInAt: reservation.firstCheckInAt ?? now,
        lastCheckInAt: now,
      },
    });
  });
}

export async function extendExpiration(reservationId: string, addMinutes: number): Promise<Reservation> {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("RESERVATION_NOT_FOUND");
  const base = reservation.expiresAt.getTime() > Date.now() ? reservation.expiresAt.getTime() : Date.now();
  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      expiresAt: new Date(base + addMinutes * 60 * 1000),
      status: reservation.status === "EXPIRED" ? "PENDING_PAYMENT" : reservation.status,
    },
  });
}

export async function getOccurrenceAvailability(occurrenceId: string): Promise<{
  capacity: number;
  booked: number;
  available: number;
}> {
  const occurrence = await prisma.eventOccurrence.findUnique({ where: { id: occurrenceId } });
  if (!occurrence) throw new Error("OCCURRENCE_NOT_FOUND");
  await expireStale();
  const booked = await bookedQuantity(prisma as unknown as Prisma.TransactionClient, occurrenceId);
  return {
    capacity: occurrence.capacity,
    booked,
    available: Math.max(0, occurrence.capacity - booked),
  };
}
