export function resolveRedirect({ accessToken, user, roles }) {
  if (!accessToken || !user) {
    return '/login';
  }

  if (roles && !roles.includes(user.role)) {
    return user.role === 'admin' ? '/admin/promotions' : '/promotions';
  }

  return null;
}
