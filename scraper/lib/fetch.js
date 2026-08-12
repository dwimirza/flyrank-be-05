import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const CACHE_DIR = join(import.meta.dirname, "..", "..", "cache");
const USER_AGENT = "polite-scraper/0.1 learning project";
const TIMEOUT_MS = 10_000;
const DELAY_MS = 500;

function cacheKey(url) {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return join(CACHE_DIR, `${hash}.html`);
}

async function loadCache(url) {
  const path = cacheKey(url);
  if (existsSync(path)) {
    const html = await readFile(path, "utf-8");
    console.log(`cached ${url}`);
    return html;
  }
  return null;
}

async function saveCache(url, html) {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }
  const path = cacheKey(url);
  await writeFile(path, html, "utf-8");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPage(url) {
  const cached = await loadCache(url);
  if (cached !== null) return cached;

  console.log(`fetching ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`HTTP ${res.status} for ${url}`);
      return null;
    }

    const html = await res.text();
    await saveCache(url, html);
    return html;
  } catch (err) {
    clearTimeout(timer);
    console.error(`Failed to fetch ${url}:`, err.message);
    return null;
  }
}

export async function fetchPages(urls) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const html = await fetchPage(urls[i]);
    results.push(html);
    if (html !== null && i < urls.length - 1) {
      await delay(DELAY_MS);
    }
  }
  return results;
}
