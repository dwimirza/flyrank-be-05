# flyrank-be-05

A polite web scraper that extracts and validates book data from
[books.toscrape.com](https://books.toscrape.com/), a demo site built
specifically for scraping practice.

> **Classification:** learning / sandbox project. This is not a production
> scraper. It scrapes a public demo site designed for this purpose, and the
> code is intentionally small and readable.

## What it does

One `npm start` run:

1. **Fetch** the 3 catalogue listing pages and all 60 book detail pages,
   with polite throttling (see below).
2. **Extract** 8 raw fields per book (title, price, availability, rating,
   image URL, UPC, description, category) using Cheerio.
3. **Normalize** raw values (e.g. `£51.77` → `51.77`, `"Three"` → `3`).
4. **Validate** each record against a Zod schema.
5. **Write** three files to `output/`:
   - `books.json` — validated book records (exactly 60)
   - `errors.json` — anything that failed, with a reason
   - `run-report.json` — run metadata (start time, duration, fetch stats)

Raw HTML is cached in `cache/` keyed by URL. Re-runs reuse the cache and make
no network requests for pages already fetched.

## Zod schema

Each book is validated against:

| field         | rule                          |
| ------------- | ----------------------------- |
| `url`         | valid URL string              |
| `title`       | non-empty string              |
| `price_gbp`   | number `>= 0`                 |
| `availability`| non-empty string              |
| `star_rating` | integer `0–5`                 |
| `image_url`   | valid URL string              |
| `upc`         | non-empty string              |
| `description` | non-empty string              |
| `category`    | non-empty string              |

Records that fail validation are reported in `output/errors.json` and excluded
from `books.json`.

## Politeness rules

- Custom `User-Agent`: `polite-scraper/0.1 learning project`
- Request timeout of 10 seconds
- At least 500ms delay between successive requests
- Failures are logged and skipped — one bad page never crashes the run
- Results are cached so re-runs avoid hitting the site unnecessarily

## How to run

Requirements: Node.js 20+.

```bash
npm install
npm start
```

The first run fetches everything (~1 minute including polite delays);
subsequent runs are served from cache and finish in seconds.

## Output example

```json
{
  "url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "title": "A Light in the Attic",
  "price_gbp": 51.77,
  "availability": "In stock (22 available)",
  "star_rating": 3,
  "image_url": "https://books.toscrape.com/media/cache/fe/72/fe72f0532301ec28892ae79a629a293c.jpg",
  "upc": "a897fe39b1053632",
  "description": "It's hard to imagine a world without A Light in the Attic...",
  "category": "Poetry"
}
```
