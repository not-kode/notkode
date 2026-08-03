// Geração do PDF do documento assinado.
//
// O documento vive como HTML (é o que foi congelado e o que o hash protege), e
// o PDF é uma renderização dele. Roda Chrome headless: na Vercel, o binário do
// @sparticuz/chromium; na máquina, o Chrome instalado. Se nada disso existir, o
// PDF simplesmente não sai — a assinatura não pode depender dele.

import puppeteer, { type Browser } from 'puppeteer-core';
import { SITE } from './nucleo';

/** Chrome do sistema, para o ambiente local. */
const CHROME_LOCAL = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

/**
 * O Chromium de serverless vem de um pacote remoto, e não de dentro do projeto.
 *
 * A versão que trazia o binário junto não funcionou na Vercel: os arquivos .br
 * não são importados por módulo nenhum, então o tracing do Next não os levava
 * para a função e ela subia sem a pasta bin. Baixar sob demanda contorna isso
 * de vez. Precisa casar com a versão do @sparticuz/chromium-min.
 */
const PACK_CHROMIUM = process.env.CHROMIUM_PACK_URL
  ?? 'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar';

async function abrirNavegador(): Promise<Browser | null> {
  // Em serverless o binário vem do pacote remoto; o import fica aqui dentro
  // para não entrar no bundle de quem não gera PDF.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await chromium.executablePath(PACK_CHROMIUM),
      headless: true,
    });
  }

  const { existsSync } = await import('node:fs');
  const local = CHROME_LOCAL.find((c) => existsSync(c));
  if (!local) return null;
  return puppeteer.launch({ executablePath: local, headless: true });
}

/**
 * Converte o HTML do documento em PDF A4.
 *
 * O HTML congelado aponta a logo por caminho absoluto do site (/brand/...), que
 * não resolve fora de uma página servida; por isso os caminhos são reescritos
 * para o domínio antes de renderizar.
 */
export async function documentoEmPdf(html: string): Promise<Uint8Array | null> {
  return (await gerarPdf(html)).pdf;
}

/**
 * Igual à anterior, mas devolve também o motivo da falha. Só a tela do /admin
 * usa: sem isso, "não foi possível gerar" não dá para diagnosticar em produção.
 */
export async function gerarPdf(html: string): Promise<{ pdf: Uint8Array | null; erro: string | null }> {
  let navegador: Browser | null = null;
  try {
    navegador = await abrirNavegador();
    if (!navegador) {
      console.warn('[assinatura] Chrome indisponível, PDF não gerado');
      return { pdf: null, erro: 'Chrome indisponível neste ambiente.' };
    }

    const pagina = await navegador.newPage();
    await pagina.setContent(html.replaceAll('src="/', `src="${SITE}/`), {
      waitUntil: 'load',
      timeout: 30_000,
    });
    // A logo e as fontes vêm da rede; sem esta folga o PDF pode sair sem elas.
    await pagina.evaluate(() => document.fonts.ready);

    const pdf = await pagina.pdf({
      format: 'a4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '0', right: '0' },
    });
    return { pdf, erro: null };
  } catch (e) {
    console.error('[assinatura] falha ao gerar PDF:', e);
    return { pdf: null, erro: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  } finally {
    await navegador?.close().catch(() => {});
  }
}

/** Nome de arquivo aceitável em qualquer sistema, a partir do título. */
export function nomeDoArquivo(titulo: string): string {
  const limpo = titulo
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${limpo || 'documento'}-assinado.pdf`;
}
