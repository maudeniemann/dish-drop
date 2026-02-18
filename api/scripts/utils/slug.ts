export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Ensure slug uniqueness within a collection
export function deduplicateSlugs(items: { slug: string }[]): void {
  const slugCounts: Record<string, number> = {};
  for (const item of items) {
    if (slugCounts[item.slug]) {
      slugCounts[item.slug]++;
      item.slug = `${item.slug}-${slugCounts[item.slug]}`;
    } else {
      slugCounts[item.slug] = 1;
    }
  }
}
