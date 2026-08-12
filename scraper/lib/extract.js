import * as cheerio from "cheerio";
import { fetchPages } from "./fetch.js";

const CATALOGUE_BASE = "https://books.toscrape.com/catalogue/";

function resolveUrl(relative, base) {
  return new URL(relative, base).href;
}

function extractBookUrls(html, pageUrl) {
  const $ = cheerio.load(html);
  const urls = [];
  $("article.product_pod").each((_i, el) => {
    const href = $(el).find("div.image_container a").attr("href");
    if (href) {
      urls.push(resolveUrl(href, pageUrl));
    }
  });
  return urls;
}

function extractBookDetail(html, bookUrl) {
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim() || null;

  const price = $("p.price_color").first().text().trim() || null;

  const availabilityText = $("p.instock.availability")
    .first()
    .text()
    .trim()
    .replace(/^\s*\n\s*/g, "")
    .trim();
  const availability = availabilityText || null;

  const starClass =
    ($("p.star-rating").attr("class") || "")
      .split(/\s+/)
      .find((c) => /^(One|Two|Three|Four|Five)$/.test(c)) || null;

  const imageSrc = $("#product_gallery img").attr("src");
  const imageUrl = imageSrc ? resolveUrl(imageSrc, bookUrl) : null;

  const upc =
    $('table.table-striped th:contains("UPC")').next("td").first().text().trim() ||
    null;

  const description =
    $("#product_description").next("p").first().text().trim() || null;

  const category =
    $("ul.breadcrumb li:not(.active)").last().text().trim() || null;

  return {
    url: bookUrl,
    title,
    price,
    availability,
    star_rating: starClass,
    image_url: imageUrl,
    upc,
    description,
    category,
  };
}

export async function extractAll(catalogueUrls) {
  const allBookUrls = new Set();

  for (const pageUrl of catalogueUrls) {
    const [html] = await fetchPages([pageUrl]);
    if (!html) continue;
    const urls = extractBookUrls(html, pageUrl);
    for (const u of urls) allBookUrls.add(u);
  }

  const uniqueUrls = [...allBookUrls];
  console.log(`\nDiscovered ${uniqueUrls.length} unique book URLs.`);

  const detailHtmls = await fetchPages(uniqueUrls);
  const books = [];

  for (let i = 0; i < uniqueUrls.length; i++) {
    const html = detailHtmls[i];
    if (!html) continue;
    const book = extractBookDetail(html, uniqueUrls[i]);
    books.push(book);
  }

  return books;
}
