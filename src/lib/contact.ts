const DEFAULT_NUMBER = "584140000000";

export function contactWhatsappNumber(): string {
  const raw = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/\D/g, "");
  return raw && raw.length >= 8 ? raw : DEFAULT_NUMBER;
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${contactWhatsappNumber()}?text=${encodeURIComponent(text)}`;
}
