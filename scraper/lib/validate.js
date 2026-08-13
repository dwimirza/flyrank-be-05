import { z } from "zod";

export const bookSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  price_gbp: z.number().gte(0),
  availability: z.string().min(1),
  star_rating: z.number().int().min(0).max(5),
  image_url: z.string().url(),
  upc: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
});

export function validateBooks(books) {
  const valid = [];
  const errors = [];

  for (const book of books) {
    const result = bookSchema.safeParse(book);
    if (result.success) {
      valid.push(result.data);
    } else {
      const reason = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      errors.push({ url: book.url, reason });
    }
  }

  return { valid, errors };
}
