import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { SESSION_COOKIE } from '@/lib/admin-auth';

// Gera o PDF do contrato NO SERVIDOR (headless Chrome), pra sair sempre igual —
// sem depender do "Salvar como PDF" do navegador do usuário.
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Em dev usa o Chrome instalado na máquina; em produção (Vercel), o binário do @sparticuz/chromium.
const LOCAL_CHROME =
  process.env.LOCAL_CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function launchBrowser() {
  const isDev = process.env.NODE_ENV === 'development';
  return puppeteer.launch({
    args: isDev ? ['--no-sandbox'] : chromium.args,
    executablePath: isDev ? LOCAL_CHROME : await chromium.executablePath(),
    headless: true,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const host = req.headers.get('host') ?? '';
  const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const url = `${proto}://${host}/admin/contrato/${id}?mode=pdf`;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    if (token && host) {
      await page.setCookie({ name: SESSION_COOKIE, value: token, domain: host.split(':')[0], path: '/' });
    }
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '18mm', right: '18mm' },
    });
    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contrato-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return new NextResponse('Falha ao gerar o PDF: ' + (err as Error).message, { status: 500 });
  }
}
