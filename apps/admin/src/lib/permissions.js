export function hasPermission(userPermissions = [], requiredPermission) {
  if (!requiredPermission) return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('*')) return true;
  if (userPermissions.includes(requiredPermission)) return true;

  const [resource] = requiredPermission.split(':');
  if (resource && userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

export function hasAnyPermission(userPermissions = [], permissionsList = []) {
  if (!permissionsList.length) return true;
  return permissionsList.some(p => hasPermission(userPermissions, p));
}
