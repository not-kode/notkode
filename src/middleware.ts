import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for those starting with:
  // - /api, /_next, /_vercel
  // - static files (containing a dot)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
