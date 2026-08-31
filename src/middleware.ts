import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifySessionToken } from './lib/admin-auth';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Páginas abertas por link (token ou código de verificação) ficam fora do
  // esquema de locale: o next-intl redirecionaria para /pt/... e quebraria o link.
  if (
    pathname.startsWith('/onboarding') || pathname.startsWith('/acompanhamento')
    || pathname.startsWith('/assinar') || pathname.startsWith('/verificar')
  ) {
    return NextResponse.next();
  }

  // /admin é fora do esquema de locale do next-intl — gate de senha próprio.
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token, Date.now())) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    // Leva a query junto: a tela de autorização do MCP vive dos parâmetros do
    // OAuth, e sem eles a pessoa voltaria do login para uma página sem pedido.
    url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // Tudo exceto /api, /_next, /_vercel e arquivos estáticos (com ponto).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
