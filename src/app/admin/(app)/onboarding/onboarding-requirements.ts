import { ACCESS_EMAIL } from '@/lib/onboarding-schema';
import type { BriefingRow } from './onboarding-view';

// ─────────────────────────────────────────────────────────────────────────
// "Retorno pro cliente": a partir das respostas do briefing, monta o que
// ainda precisamos que o cliente providencie (acessos, identidade, fotos...)
// para começar. Pede só o que falta — não repete o que ele já indicou ter.
// A saída vira um checklist no drawer + uma mensagem pronta pro WhatsApp.
// ─────────────────────────────────────────────────────────────────────────

export type ReqItem = { label: string; note?: string };
export type ReqGroup = { title: string; intro?: string; items: ReqItem[] };

/** Prazo padrão de retorno do cliente, em dias. */
export const REQUEST_DEADLINE_DAYS = 7;

function read(r: BriefingRow, id: string): string {
  const v = r.respostas[id];
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

export function buildRequirements(r: BriefingRow): ReqGroup[] {
  const groups: ReqGroup[] = [];

  // ── Acessos ──────────────────────────────────────────────────────────
  const acessos: ReqItem[] = [];

  if (read(r, 'acesso_meta') !== 'Convite enviado') {
    acessos.push({ label: 'Meta Business (Instagram/Facebook da marca)' });
  }

  const google = read(r, 'acesso_google');
  if (google !== 'Convite enviado') {
    acessos.push({ label: 'Google Ads', note: 'e o ID da conta (000-000-0000)' });
  } else if (!read(r, 'acesso_google_id')) {
    acessos.push({ label: 'ID da conta do Google Ads (000-000-0000)' });
  }

  if (read(r, 'acesso_analytics') === 'Não tenho ainda') {
    acessos.push({
      label: 'GA4 / GTM / Pixel da Meta',
      note: 'ainda não existem — só confirmar que podemos criar no seu nome',
    });
  }

  const dominio = read(r, 'acesso_dominio');
  acessos.push({
    label: 'Acesso ao DNS do domínio',
    note: dominio ? `registrado em ${dominio}` : 'onde o domínio está registrado',
  });

  if (read(r, 'site_atual') === 'Sim') {
    const url = read(r, 'site_url');
    acessos.push({ label: 'Acesso ao site atual', note: url || undefined });
  }

  if (acessos.length > 0) {
    groups.push({
      title: 'Acessos',
      intro: `Convide ${ACCESS_EMAIL} como administrador em cada um (nunca compartilhe senha):`,
      items: acessos,
    });
  }

  // ── Identidade visual ────────────────────────────────────────────────
  const identidade: ReqItem[] = [];
  const temId = read(r, 'tem_identidade');

  if (temId === 'Não tenho' || temId === '') {
    identidade.push({
      label: 'Referências visuais',
      note: 'como você não tem identidade fechada, mande marcas/estilos que curte — a gente cria',
    });
  } else {
    identidade.push({
      label: 'Logo em PNG e em vetor (SVG, AI ou PDF editável)',
      note: 'precisamos de um arquivo que dê pra manipular, não só imagem',
    });
    identidade.push({ label: 'Cores e fontes da marca' });
    if (!read(r, 'link_materiais')) {
      identidade.push({ label: 'Link da pasta com os materiais da marca' });
    }
  }

  groups.push({ title: 'Identidade visual', items: identidade });

  // ── Fotos e vídeos ───────────────────────────────────────────────────
  const fotos: ReqItem[] = [];
  const temFotos = read(r, 'tem_fotos');
  if (temFotos === 'Sim, prontos') {
    fotos.push({ label: 'Fotos e vídeos reais do produto', note: 'os arquivos em alta' });
  } else if (temFotos === 'Alguns') {
    fotos.push({ label: 'As fotos e vídeos do produto que você já tem' });
  } else {
    fotos.push({
      label: 'Fotos e vídeos do produto',
      note: 'você marcou que ainda não tem — vamos alinhar a produção',
    });
  }
  groups.push({ title: 'Fotos e vídeos', items: fotos });

  // ── Estudo de público (se disse ter e não anexou) ────────────────────
  const temEstudo = read(r, 'tem_estudo');
  const anexou = read(r, 'estudo_link') || r.files.length > 0;
  if (temEstudo === 'Sim, tenho' && !anexou) {
    groups.push({
      title: 'Estudo de público',
      items: [{ label: 'O estudo do seu público que você mencionou', note: 'PDF, planilha ou link' }],
    });
  }

  return groups;
}

/** Data-limite formatada (hoje + prazo). */
export function deadlineLabel(days = REQUEST_DEADLINE_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
}

/** Mensagem de WhatsApp pronta pra colar, montada a partir dos grupos. */
export function buildClientMessage(r: BriefingRow, groups: ReqGroup[]): string {
  const deadline = deadlineLabel();
  const lines: string[] = [];

  lines.push(`Oi, ${r.orgName}! 🙌 Recebemos seu briefing — obrigado por preencher.`);
  lines.push('');
  lines.push(
    `Pra gente já começar a montar tudo, preciso que você me envie os itens abaixo até *${deadline}* (${REQUEST_DEADLINE_DAYS} dias):`,
  );

  for (const g of groups) {
    lines.push('');
    lines.push(`*${g.title}*${g.intro ? ` — ${g.intro}` : ''}`);
    for (const it of g.items) {
      lines.push(`• ${it.label}${it.note ? ` (${it.note})` : ''}`);
    }
  }

  lines.push('');
  lines.push('Qualquer dúvida em algum item, é só me chamar aqui. Assim que chegar, a gente começa! 🚀');

  return lines.join('\n');
}
