export function resolveEntitySlug(input: any): string | null {
  if (!input) return null

  if (typeof input === "string") {
    return input
  }

  if (input.entity_slug) return input.entity_slug

  if (input.slug) return input.slug

  if (input.name) {
    return input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  
  if (input.label) {
    return input.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return null
}
