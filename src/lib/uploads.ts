import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/src/lib/db";
import type { UploadKind } from "@prisma/client";

const KIND_DIRS: Record<UploadKind, string> = {
  EVENT_IMAGE: "events",
  RECEIPT: "receipts",
};

const RECEIPT_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_BYTES = 8 * 1024 * 1024;

export type UploadInput = {
  kind: UploadKind;
  file: File;
};

export type StoredUpload = {
  id: string;
  path: string;
  publicUrl: string;
};

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export function validateUpload(kind: UploadKind, file: File): string | null {
  if (file.size <= 0) return "Archivo vacío";
  if (file.size > MAX_BYTES) return "El archivo supera 8 MB";
  const allowed = kind === "RECEIPT" ? RECEIPT_MIME : IMAGE_MIME;
  if (!allowed.has(file.type)) return "Formato no permitido";
  return null;
}

async function uploadToBlob(
  subdir: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const result = await put(`${subdir}/${filename}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return result.url;
}

async function uploadToDisk(
  subdir: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, buffer);
  return `/uploads/${subdir}/${filename}`;
}

export async function storeUpload({ kind, file }: UploadInput): Promise<StoredUpload> {
  const error = validateUpload(kind, file);
  if (error) throw new Error(error);

  const subdir = KIND_DIRS[kind];
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${extFromMime(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const publicUrl = process.env.BLOB_READ_WRITE_TOKEN
    ? await uploadToBlob(subdir, filename, buffer, file.type)
    : await uploadToDisk(subdir, filename, buffer);

  const record = await prisma.uploadedFile.create({
    data: {
      kind,
      path: publicUrl,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return { id: record.id, path: publicUrl, publicUrl };
}
