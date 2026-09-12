// Only restore local application URLs supplied by the route guard.
export function getLoginDestination(user, from) {
  if (from?.pathname?.startsWith('/') && !from.pathname.startsWith('//') && from.pathname !== '/login') {
    return { pathname: from.pathname, search: from.search || '', hash: from.hash || '' };
  }
  return user.onboardingStatus === 'completed' ? '/profile' : '/onboarding';
}
