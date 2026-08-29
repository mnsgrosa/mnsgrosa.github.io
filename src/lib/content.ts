import { getCollection } from 'astro:content';
import { execSync } from 'node:child_process';

// Vite glob of every markdown file inside src/content, keyed by absolute path.
// Used to avoid calling getCollection() on empty collections, which logs a warning.
const contentFiles = import.meta.glob('/src/content/**/*.{md,mdx}');

// Cache of the last-commit date per repo-relative content file path, so each
// markdown only triggers one `git log` call during a build.
const commitDateCache = new Map<string, string>();

/**
 * Return the ISO commit date (`%cI`) of the last commit that touched a given
 * content file, or an empty string when the file is uncommitted (e.g. a local
 * draft) or git is unavailable.
 */
export function getCommitDate(collection: string, id: string): string {
  const filePath = `src/content/${collection}/${id}`;
  const cached = commitDateCache.get(filePath);
  if (cached !== undefined) return cached;

  let date = '';
  try {
    date = execSync(`git log -1 --format=%cI -- ${filePath}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    date = '';
  }
  commitDateCache.set(filePath, date);
  return date;
}

/**
 * Effective upload/display date for a content entry: the git commit date when
 * available (newest commits first), falling back to the frontmatter `date` for
 * files that are not committed yet.
 */
export function entrySortDate(entry: {
  collection: string;
  id: string;
  data: { date?: Date };
}): number {
  const commit = getCommitDate(entry.collection, entry.id);
  if (commit) return new Date(commit).getTime();
  return entry.data.date?.getTime() ?? 0;
}

/** Sort a list of content entries by git upload date, newest first. */
export function sortByUploadDate<T extends {
  collection: string;
  id: string;
  data: { date?: Date };
}>(entries: T[]): T[] {
  return entries.slice().sort((a, b) => entrySortDate(b) - entrySortDate(a));
}

/**
 * Parse a tags frontmatter string like `"data science, mlops, devops."` into an
 * array of trimmed tags. The trailing `.` marks the end of the list and is
 * always stripped; empty entries are dropped.
 */
export function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/\.\s*$/, '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

type ListCollection = 'portfolio' | 'posts' | 'estudos' | 'diversos';

/**
 * Like getCollection(), but returns [] (without logging a warning) for
 * collections that have no content files yet (e.g. newly created, still-empty
 * sections such as "estudos" or "diversos").
 */
export async function safeGetCollection(collection: ListCollection) {
  const prefix = `/src/content/${collection}/`;
  const hasEntries = Object.keys(contentFiles).some((path) => path.startsWith(prefix));
  if (!hasEntries) {
    return [];
  }
  return getCollection(collection);
}

/**
 * Format a date-only value as "Jan 2, 2006" (Hugo's "Jan 2, 2006" layout).
 * Rendered in UTC so date-only frontmatter (e.g. `date: 2026-01-29`) never
 * shifts a day depending on the build machine's local timezone.
 */
export function formatDate(date?: Date): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
