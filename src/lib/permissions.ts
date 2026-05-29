import type { Role, User } from "@prisma/client";

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function isOperator(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "OPERATOR";
}

export function hasRole(user: Pick<User, "role"> | null | undefined, ...roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}

export const adminOnly = {
  manageEvents: true,
  manageExchangeRate: true,
  managePaymentMethods: true,
  extendReservation: true,
  overrideOverbooking: true,
} as const;

export const operatorAllowed = {
  viewReservations: true,
  viewReceipts: true,
  confirmReservation: true,
  rejectReservation: true,
  cancelReservation: true,
} as const;
