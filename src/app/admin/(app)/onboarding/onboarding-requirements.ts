import { ACCESS_EMAIL } from '@/lib/onboarding-schema';
import type { BriefingRow } from './onboarding-view';

// ─────────────────────────────────────────────────────────────────────────
// "Retorno pro cliente": a partir das respostas do briefing, monta uma
// mensagem de WhatsApp na voz da Notkode — chamando o cliente pra criar as
// contas/liberar acessos e mandar materiais (logo editável, fotos e vídeos)
// dentro do prazo. Adapta o texto ao que ele já indicou ter: não pede o que
// já foi feito.
// ─────────────────────────────────────────────────────────────────────────

/** Prazo padrão de retorno do cliente, em dias. */
export const REQUEST_DEADLINE_DAYS = 7;

function read(r: BriefingRow, id: string): string {
  const v = r.respostas[id];
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

/** Junta uma lista em texto natural: "A, B e C". */
function humanList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/** Data-limite formatada (hoje + prazo). */
export function deadlineLabel(days = REQUEST_DEADLINE_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
}

/** Mensagem de WhatsApp pronta pra colar, na voz da Notkode. */
export function buildClientMessage(r: BriefingRow): string {
  const deadline = deadlineLabel();
  const p: string[] = [];

  p.push(`Oi, ${r.orgName}! Tudo bem? 🙌`);
  p.push(
    'Recebi seu briefing por aqui, ficou ótimo — muito obrigado! Pra eu já colocar a mão na massa e começar a montar sua estrutura, preciso de umas coisas suas ' +
      `nos próximos ${REQUEST_DEADLINE_DAYS} dias (até ${deadline}):`,
  );

  // 1) Contas & acessos ────────────────────────────────────────────────
  const convites: string[] = [];
  if (read(r, 'acesso_meta') !== 'Convite enviado') convites.push('Meta Business (Instagram/Facebook)');
  const googleEnviado = read(r, 'acesso_google') === 'Convite enviado';
  if (!googleEnviado) convites.push('Google Ads');

  const acessoFrases: string[] = [];
  if (convites.length > 0) {
    acessoFrases.push(
      `me convide como administrador (${ACCESS_EMAIL}) no ${humanList(convites)}` +
        ' — se alguma conta ainda não existir, é só criar e me convidar',
    );
  }
  if (googleEnviado && !read(r, 'acesso_google_id')) {
    acessoFrases.push('me passe o ID da conta do Google Ads');
  }
  const dominio = read(r, 'acesso_dominio');
  acessoFrases.push(`e me dê acesso ao DNS do domínio${dominio ? ` (${dominio})` : ''}`);
  if (read(r, 'site_atual') === 'Sim') {
    const url = read(r, 'site_url');
    acessoFrases.push(`+ acesso ao site atual${url ? ` (${url})` : ''}`);
  }
  p.push(`1️⃣ *Criar/liberar os acessos* — ${acessoFrases.join('; ')}.`);

  // 2) Materiais da marca ──────────────────────────────────────────────
  const temId = read(r, 'tem_identidade');
  const temIdentidade = temId !== '' && temId !== 'Não tenho';
  const materiais: string[] = [];
  if (temIdentidade) {
    materiais.push('a logo em vetor (arquivo editável, não só imagem) e as cores e fontes da marca');
  } else {
    materiais.push('referências de marcas e estilos que você curte, pra eu criar sua identidade');
  }
  const temFotos = read(r, 'tem_fotos');
  if (temFotos === 'Ainda não' || temFotos === '') {
    materiais.push('e a gente já alinha a produção das fotos e vídeos do produto');
  } else {
    materiais.push('e as fotos e vídeos reais do produto');
  }
  p.push(`2️⃣ *Me mandar os materiais* — ${materiais.join(', ')}.`);

  p.push(
    'Assim que isso chegar, eu já começo a produzir tudo. Qualquer dúvida em algum item, me chama por aqui! 🚀',
  );

  return p.join('\n\n');
}
