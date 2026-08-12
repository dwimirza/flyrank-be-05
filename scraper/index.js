import { fetchPages } from "./lib/fetch.js";

const URLS = [
  "https://books.toscrape.com/catalogue/page-1.html",
  "https://books.toscrape.com/catalogue/page-2.html",
  "https://books.toscrape.com/catalogue/page-3.html",
];

const results = await fetchPages(URLS);

const success = results.filter((r) => r !== null).length;
console.log(`\nFetched ${success}/${URLS.length} pages successfully.`);
