import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifySessionToken } from './lib/admin-auth';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin é fora do esquema de locale do next-intl — gate de senha próprio.
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token, Date.now())) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // Tudo exceto /api, /_next, /_vercel e arquivos estáticos (com ponto).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
