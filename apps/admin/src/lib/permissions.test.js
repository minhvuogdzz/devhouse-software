import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission } from './permissions.js';

describe('Admin RBAC permissions', () => {
  it('grants all permissions to superadmin with wildcard *', () => {
    expect(hasPermission(['*'], 'services:create')).toBe(true);
    expect(hasPermission(['*'], 'users:delete')).toBe(true);
    expect(hasPermission(['*'], 'roles:manage')).toBe(true);
  });

  it('checks exact permission match', () => {
    const editorPermissions = ['services:read', 'services:update', 'blog:read'];
    expect(hasPermission(editorPermissions, 'services:read')).toBe(true);
    expect(hasPermission(editorPermissions, 'services:delete')).toBe(false);
  });

  it('supports module wildcard prefix e.g. services:*', () => {
    const perms = ['services:*'];
    expect(hasPermission(perms, 'services:read')).toBe(true);
    expect(hasPermission(perms, 'services:create')).toBe(true);
    expect(hasPermission(perms, 'projects:read')).toBe(false);
  });

  it('handles empty or undefined permissions gracefully', () => {
    expect(hasPermission(null, 'services:read')).toBe(false);
    expect(hasPermission([], 'services:read')).toBe(false);
    expect(hasPermission(['services:read'], null)).toBe(true);
  });

  it('checks hasAnyPermission correctly', () => {
    const perms = ['projects:read', 'blog:read'];
    expect(hasAnyPermission(perms, ['services:read', 'projects:read'])).toBe(true);
    expect(hasAnyPermission(perms, ['services:read', 'users:read'])).toBe(false);
    expect(hasAnyPermission(['*'], ['anything'])).toBe(true);
  });
});
