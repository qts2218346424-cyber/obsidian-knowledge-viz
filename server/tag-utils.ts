import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

/**
 * Parse frontmatter from markdown content using gray-matter.
 */
export function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const parsed = matter(content);
  return {
    frontmatter: parsed.data,
    body: parsed.content,
  };
}

/**
 * Serialize frontmatter and body back into a full markdown file string.
 */
export function serializeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  return matter.stringify(body, frontmatter);
}

/**
 * Rename a tag in both frontmatter.tags and body #tag references.
 */
export function renameTagInContent(content: string, oldTag: string, newTag: string): string {
  const { frontmatter, body } = parseFrontmatter(content);

  // Rename in frontmatter.tags
  if (Array.isArray(frontmatter.tags)) {
    frontmatter.tags = frontmatter.tags.map((t: string) =>
      t === oldTag ? newTag : t
    );
  } else if (typeof frontmatter.tags === 'string') {
    const tags = frontmatter.tags.split(',').map((t: string) => t.trim());
    frontmatter.tags = tags.map((t: string) => (t === oldTag ? newTag : t));
  }

  // Replace #oldTag in body text
  const tagPattern = new RegExp(
    `#(${escapeRegExp(oldTag)})(?=[^a-zA-Z\\u4e00-\\u9fff\\w/-]|$)`,
    'g'
  );
  const newBody = body.replace(tagPattern, `#${newTag}`);

  return serializeFrontmatter(frontmatter, newBody);
}

/**
 * Remove a tag from both frontmatter.tags and body #tag references.
 * Case-insensitive comparison for frontmatter.
 */
export function removeTagFromContent(content: string, tag: string): string {
  const { frontmatter, body } = parseFrontmatter(content);

  // Remove from frontmatter.tags (case-insensitive)
  if (Array.isArray(frontmatter.tags)) {
    frontmatter.tags = frontmatter.tags.filter(
      (t: string) => t.toLowerCase() !== tag.toLowerCase()
    );
  } else if (typeof frontmatter.tags === 'string') {
    const tags = frontmatter.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.toLowerCase() !== tag.toLowerCase());
    frontmatter.tags = tags;
  }

  // Remove #tag from body text
  const tagPattern = new RegExp(
    `#${escapeRegExp(tag)}(?=[^a-zA-Z\\u4e00-\\u9fff\\w/-]|$)`,
    'g'
  );
  const newBody = body.replace(tagPattern, '');

  return serializeFrontmatter(frontmatter, newBody);
}

/**
 * Add a tag to frontmatter.tags if not already present (case-insensitive dedup).
 * Creates the tags array if it doesn't exist.
 */
export function addTagToContent(content: string, tag: string): string {
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.tags) {
    frontmatter.tags = [tag];
  } else if (Array.isArray(frontmatter.tags)) {
    const exists = frontmatter.tags.some(
      (t: string) => t.toLowerCase() === tag.toLowerCase()
    );
    if (!exists) {
      frontmatter.tags.push(tag);
    }
  } else if (typeof frontmatter.tags === 'string') {
    const tags = frontmatter.tags.split(',').map((t: string) => t.trim());
    const exists = tags.some(
      (t: string) => t.toLowerCase() === tag.toLowerCase()
    );
    if (!exists) {
      tags.push(tag);
    }
    frontmatter.tags = tags;
  }

  return serializeFrontmatter(frontmatter, body);
}

/**
 * Walk all .md files in a vault directory, parse frontmatter tags,
 * and return a Map of tag (lowercase) -> relative file paths.
 * Skips hidden directories (starting with '.').
 */
export function scanVaultTags(vaultPath: string): Map<string, string[]> {
  const tagMap = new Map<string, string[]>();
  const files = walkDir(vaultPath);

  for (const filePath of files) {
    if (!filePath.endsWith('.md')) continue;

    const relPath = path.relative(vaultPath, filePath).replace(/\\/g, '/');
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const { frontmatter } = parseFrontmatter(content);
    let tags: string[] = [];

    if (Array.isArray(frontmatter.tags)) {
      tags = frontmatter.tags.map((t: string) => String(t));
    } else if (typeof frontmatter.tags === 'string') {
      tags = frontmatter.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    }

    for (const tag of tags) {
      const key = tag.toLowerCase();
      if (!tagMap.has(key)) {
        tagMap.set(key, []);
      }
      tagMap.get(key)!.push(relPath);
    }
  }

  return tagMap;
}

/**
 * Recursively walk a directory, skipping hidden dirs (starting with '.').
 * Returns an array of absolute file paths.
 */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
