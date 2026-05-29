import { Prisma } from "@prisma/client";
import type { PaymentMethodKind } from "@prisma/client";
import { prisma } from "@/src/lib/db";

export type PricingInput = {
  unitPriceUsd: Prisma.Decimal | number | string;
  quantity: number;
};

export function calcLineUsd(input: PricingInput): Prisma.Decimal {
  const unit = new Prisma.Decimal(input.unitPriceUsd as never);
  return unit.mul(input.quantity);
}

export function sumUsd(lines: PricingInput[]): Prisma.Decimal {
  return lines.reduce((acc, line) => acc.add(calcLineUsd(line)), new Prisma.Decimal(0));
}

export type CalculatedAmount = {
  amountUsd: Prisma.Decimal;
  amountBs: Prisma.Decimal | null;
  exchangeRate: Prisma.Decimal | null;
};

export async function getActiveExchangeRate(): Promise<Prisma.Decimal | null> {
  const rate = await prisma.exchangeRate.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return rate ? new Prisma.Decimal(rate.bsPerUsd as never) : null;
}

export async function calculateAmount(
  lines: PricingInput[],
  paymentMethod: PaymentMethodKind,
): Promise<CalculatedAmount> {
  const amountUsd = sumUsd(lines);
  if (paymentMethod === "USDT") {
    return { amountUsd, amountBs: null, exchangeRate: null };
  }
  const rate = await getActiveExchangeRate();
  if (!rate) {
    throw new Error("NO_ACTIVE_EXCHANGE_RATE");
  }
  return {
    amountUsd,
    amountBs: amountUsd.mul(rate),
    exchangeRate: rate,
  };
}
