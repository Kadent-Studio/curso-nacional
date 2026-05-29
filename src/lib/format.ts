import type { Decimal } from "@prisma/client/runtime/library";

type Numeric = number | string | Decimal;

function toNumber(value: Numeric): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number(value.toString());
}

export function formatUsd(value: Numeric): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatBs(value: Numeric): string {
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))}`;
}

export function formatUsdt(value: Numeric): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))} USDT`;
}

const dateFormatter = new Intl.DateTimeFormat("es-VE", {
  weekday: "short",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-VE", {
  weekday: "short",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

export function formatDateTime(value: Date): string {
  return dateTimeFormatter.format(value);
}

export function formatReservationCode(sequence: number): string {
  return `CN-${sequence.toString().padStart(6, "0")}`;
}
