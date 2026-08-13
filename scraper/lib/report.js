import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(import.meta.dirname, "..", "..", "output");

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
}

async function writeJson(filename, data) {
  await ensureOutputDir();
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function writeOutputs({ books, errors, report }) {
  await writeJson("books.json", books);
  await writeJson("errors.json", errors);
  await writeJson("run-report.json", report);
}
