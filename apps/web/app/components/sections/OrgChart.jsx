import React from 'react';

/**
 * Company org chart drawn as a branching tree. Lines and the light pulses that travel along them
 * are pure CSS (see "Org chart" in app.css), so it renders on the server and needs no JavaScript.
 *
 * `nodes` is a flat list: { id, parent, label?, members: [{ name, role }] }.
 * A node with several members is shown as one group card (e.g. a board of directors).
 */

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] || '';
  const first = parts.length > 1 ? parts[0] : '';
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function buildTree(nodes = []) {
  const byParent = new Map();
  for (const node of nodes) {
    const key = node.parent || '';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(node);
  }
  const attach = (node, seen) => {
    if (seen.has(node.id)) return { ...node, children: [] }; // guard against bad data loops
    const nextSeen = new Set(seen).add(node.id);
    return {
      ...node,
      children: (byParent.get(node.id) || []).map(child => attach(child, nextSeen)),
    };
  };
  return (byParent.get('') || []).map(root => attach(root, new Set()));
}

function Member({ member, large }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        aria-hidden="true"
        className={`${large ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-sm'} org-avatar rounded-full flex items-center justify-center font-display font-bold shrink-0`}
      >
        {initials(member.name)}
      </div>
      <div className="min-w-0 text-left">
        <p className="font-display font-bold text-fg leading-snug">{member.name}</p>
        <p className="text-sm text-fg-muted leading-snug mt-0.5">{member.role}</p>
      </div>
    </div>
  );
}

function OrgNode({ node, depth }) {
  const isGroup = node.members.length > 1;
  return (
    <li>
      <div
        className={`org-node ${depth === 0 ? 'org-node-root' : ''} ${isGroup ? 'is-group' : ''}`}
      >
        {node.label && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-3 text-center">
            {node.label}
          </p>
        )}
        <div className={isGroup ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
          {node.members.map(member => (
            <Member key={member.name} member={member} large={depth === 0} />
          ))}
        </div>
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function OrgChart({ nodes }) {
  const roots = buildTree(nodes);
  if (roots.length === 0) return null;
  return (
    <div className="org" role="group" aria-label="Organization chart">
      <ul>
        {roots.map(root => (
          <OrgNode key={root.id} node={root} depth={0} />
        ))}
      </ul>
    </div>
  );
}
