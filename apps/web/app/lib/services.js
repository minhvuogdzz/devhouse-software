/**
 * Puts the services in order for the Services page: each group followed by the kinds of service
 * inside it. `parent` of a kind is { slug, name }, and it is null for a group.
 */
export function groupServices(services) {
  const groups = services.filter(service => !service.parent);
  const inside = new Map();
  for (const service of services) {
    if (!service.parent) continue;
    const list = inside.get(service.parent.slug) || [];
    list.push(service);
    inside.set(service.parent.slug, list);
  }
  const known = new Set(groups.map(group => group.slug));
  return {
    grouped: groups.map(group => ({ group, types: inside.get(group.slug) || [] })),
    // Kinds whose group is hidden or missing are still shown, so none of them is lost
    orphans: services.filter(service => service.parent && !known.has(service.parent.slug)),
  };
}
