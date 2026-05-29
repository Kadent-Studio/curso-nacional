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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
}

export function formatDaysUntil(date: Date, now: Date = new Date()): string {
  const days = daysUntil(date, now);
  if (days < 0) {
    const past = Math.abs(days);
    if (past === 1) return "ayer";
    return `hace ${past} días`;
  }
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days < 7) return `en ${days} días`;
  if (days < 14) return "en 1 semana";
  if (days < 30) return `en ${Math.floor(days / 7)} semanas`;
  if (days < 60) return "en 1 mes";
  return `en ${Math.floor(days / 30)} meses`;
}
