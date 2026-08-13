import { extractAll } from "./lib/extract.js";
import { normalizeBooks } from "./lib/normalize.js";
import { validateBooks } from "./lib/validate.js";
import {
  getFetchStats,
  getFetchErrors,
  resetFetchStats,
  resetFetchErrors,
} from "./lib/fetch.js";
import { writeOutputs } from "./lib/report.js";

const CATALOGUE_URLS = [
  "https://books.toscrape.com/catalogue/page-1.html",
  "https://books.toscrape.com/catalogue/page-2.html",
  "https://books.toscrape.com/catalogue/page-3.html",
];

const startedAt = new Date().toISOString();
const startedAtMs = Date.now();

resetFetchStats();
resetFetchErrors();

const rawBooks = await extractAll(CATALOGUE_URLS);
const books = normalizeBooks(rawBooks);
const { valid, errors: validationErrors } = validateBooks(books);

const fetchErrors = getFetchErrors();
const errors = [...fetchErrors, ...validationErrors];
errors.sort((a, b) => String(a.url).localeCompare(String(b.url)));

valid.sort((a, b) => a.url.localeCompare(b.url));

const stats = getFetchStats();

const report = {
  startedAt,
  durationMs: Date.now() - startedAtMs,
  pagesFetched: { fresh: stats.fresh, cached: stats.cached },
  booksExtracted: valid.length,
  errorCount: errors.length,
};

await writeOutputs({ books: valid, errors, report });

console.log(`\nTotal unique books: ${valid.length}`);
console.log(`Errors: ${errors.length}`);
console.log(
  `Pages fetched: ${stats.fresh} fresh, ${stats.cached} cached`
);

console.log("\n--- Sample normalized records ---");
valid.slice(0, 3).forEach((b, i) => {
  console.log(`\n[${i + 1}]`, JSON.stringify(b, null, 2));
});
