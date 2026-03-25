interface SluggableEntity {
  entity_slug?: string | null;
  slug?: string | null;
  name?: string | null;
  label?: string | null;
}

export function resolveEntitySlug(input: string | SluggableEntity | null | undefined): string | null {
  if (!input) return null

  if (typeof input === "string") {
    return input
  }

  if (input.entity_slug) return input.entity_slug

  if (input.slug) return input.slug

  if (input.name) {
    return input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  
  if (input.label) {
    return input.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return null
}
