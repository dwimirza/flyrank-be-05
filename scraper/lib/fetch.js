import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const CACHE_DIR = join(import.meta.dirname, "..", "..", "cache");
const USER_AGENT = "polite-scraper/0.1 learning project";
const TIMEOUT_MS = 10_000;
const DELAY_MS = 500;

let stats = { fresh: 0, cached: 0 };
let errors = [];

export function resetFetchStats() {
  stats = { fresh: 0, cached: 0 };
}

export function getFetchStats() {
  return { ...stats };
}

export function resetFetchErrors() {
  errors = [];
}

export function getFetchErrors() {
  return errors;
}

function cacheKey(url) {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return join(CACHE_DIR, `${hash}.html`);
}

async function loadCache(url) {
  const path = cacheKey(url);
  if (existsSync(path)) {
    const html = await readFile(path, "utf-8");
    console.log(`cached ${url}`);
    stats.cached += 1;
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
      errors.push({ url, reason: `HTTP ${res.status}` });
      return null;
    }

    const html = await res.text();
    await saveCache(url, html);
    stats.fresh += 1;
    return html;
  } catch (err) {
    clearTimeout(timer);
    console.error(`Failed to fetch ${url}:`, err.message);
    errors.push({ url, reason: err.message });
    return null;
  }
}

export async function fetchPages(urls) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const freshBefore = stats.fresh;
    const html = await fetchPage(urls[i]);
    results.push(html);
    const wasFresh = stats.fresh > freshBefore;
    if (html !== null && wasFresh && i < urls.length - 1) {
      await delay(DELAY_MS);
    }
  }
  return results;
}
