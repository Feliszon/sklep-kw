import "server-only";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const MAX_FILE_BYTES = 4 * 1024 * 1024;

/**
 * Zapisuje zdjęcia produktu. Na Vercelu (BLOB_READ_WRITE_TOKEN ustawiony) - do
 * Vercel Blob, bo system plików serwera jest tylko do odczytu. Lokalnie - do public/uploads.
 * Zwraca listę publicznych URL-i.
 */
export async function saveProductImages(files, slugBase) {
  const realFiles = files.filter((f) => f && typeof f.arrayBuffer === "function" && f.size > 0);
  const urls = [];

  for (const file of realFiles) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) throw new Error(`Nieobsługiwany format pliku „${file.name}” - użyj JPG, PNG lub WebP.`);
    if (file.size > MAX_FILE_BYTES) throw new Error(`Zdjęcie „${file.name}” jest za duże (max 4 MB).`);

    const filename = `${slugBase || "produkt"}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${filename}`, buffer, { access: "public", contentType: file.type });
      urls.push(blob.url);
    } else {
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
      urls.push(`/uploads/${filename}`);
    }
  }
  return urls;
}
