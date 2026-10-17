import type { User } from '../types/models';
import type { Path } from 'react-router-dom';
// Only restore local application URLs supplied by the route guard.
export function getLoginDestination(user: Pick<User, 'onboardingStatus'>, from?: Partial<Path> | null) {
  if (from?.pathname?.startsWith('/') && !from.pathname.startsWith('//') && from.pathname !== '/login') {
    return { pathname: from.pathname, search: from.search || '', hash: from.hash || '' };
  }
  return user.onboardingStatus === 'completed' ? '/profile' : '/onboarding';
}
