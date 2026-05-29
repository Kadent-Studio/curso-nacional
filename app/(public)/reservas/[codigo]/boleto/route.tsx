import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

import { getReservationByCode } from "@/src/lib/public-data";
import { TicketPdf } from "@/src/lib/ticket-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function baseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  return (fromEnv && fromEnv.replace(/\/$/, "")) || "http://localhost:3000";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ codigo: string }> },
) {
  const { codigo } = await ctx.params;
  const reservation = await getReservationByCode(decodeURIComponent(codigo));
  if (!reservation) {
    return new NextResponse("No encontrado.", { status: 404 });
  }
  if (reservation.status !== "CONFIRMED") {
    return new NextResponse(
      "El boleto solo está disponible cuando la inscripción está confirmada.",
      { status: 409 },
    );
  }

  const totalQty = reservation.items.reduce((acc, it) => acc + it.quantity, 0);
  const variantLabel =
    reservation.items.length === 1
      ? reservation.items[0].priceVariant.name
      : "Varias tarifas";
  const occurrence = reservation.items[0]?.occurrence;
  if (!occurrence) {
    return new NextResponse("La inscripción no tiene ocurrencia.", { status: 500 });
  }

  const verifyUrl = `${baseUrl()}/admin/verificar/${encodeURIComponent(reservation.code)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    color: { dark: "#0b0b0b", light: "#f7f4ec" },
  });

  const buffer = await renderToBuffer(
    <TicketPdf
      data={{
        code: reservation.code,
        buyerFullName: `${reservation.buyerFirstName} ${reservation.buyerLastName}`,
        buyerWhatsapp: reservation.buyerWhatsapp,
        eventTitle: reservation.event.title,
        eventLocation: reservation.event.location,
        eventModality: reservation.event.modality,
        occurrenceStartsAt: occurrence.startsAt,
        occurrenceEndsAt: occurrence.endsAt,
        quantity: totalQty,
        variantLabel,
        qrDataUrl,
        verifyUrl,
        issuedAt: new Date(),
      }}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="boleto-${reservation.code}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
