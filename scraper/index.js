import { extractAll } from "./lib/extract.js";
import { normalizeBooks } from "./lib/normalize.js";

const CATALOGUE_URLS = [
  "https://books.toscrape.com/catalogue/page-1.html",
  "https://books.toscrape.com/catalogue/page-2.html",
  "https://books.toscrape.com/catalogue/page-3.html",
];

const rawBooks = await extractAll(CATALOGUE_URLS);
const books = normalizeBooks(rawBooks);

console.log(`\nTotal unique books: ${books.length}`);

console.log("\n--- Sample normalized records ---");
books.slice(0, 3).forEach((b, i) => {
  console.log(`\n[${i + 1}]`, JSON.stringify(b, null, 2));
});
