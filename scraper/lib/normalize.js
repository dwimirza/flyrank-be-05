const RATING_MAP = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
};

function parsePrice(raw) {
  if (!raw) return null;
  const match = raw.match(/[\d,.]+/);
  return match ? Number.parseFloat(match[0]) : null;
}

function parseRating(word) {
  if (!word) return null;
  return RATING_MAP[word] ?? null;
}

export function normalizeBook(raw) {
  return {
    url: raw.url,
    title: raw.title ? raw.title.trim() : null,
    price_gbp: parsePrice(raw.price),
    availability: raw.availability ? raw.availability.trim() : null,
    star_rating: parseRating(raw.star_rating),
    image_url: raw.image_url ? raw.image_url.trim() : null,
    upc: raw.upc ? raw.upc.trim() : null,
    description: raw.description ? raw.description.trim() : null,
    category: raw.category ? raw.category.trim() : null,
  };
}

export function normalizeBooks(rawBooks) {
  const seen = new Set();
  const deduped = [];

  for (const raw of rawBooks) {
    if (seen.has(raw.url)) continue;
    seen.add(raw.url);
    deduped.push(normalizeBook(raw));
  }

  return deduped;
}
