import type { InclusionGroup, TimelinePhase } from '@/components/ui/pricing-form';

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type LeadEmailInput = {
  // Audience: 'internal' = pra Notkode (com bloco de contato em destaque), 'lead' = pra quem preencheu
  audience: 'internal' | 'lead';
  // Identificação do projeto
  serviceTag: string;
  reportTitle: string;
  // Faixa
  estimatedMin: number | null;
  estimatedMax: number | null;
  // Escopo + cronograma (do schema)
  inclusions: InclusionGroup[];
  timeline: TimelinePhase[];
  // Contato (usado no bloco de cabeçalho do email interno)
  lead: { name: string; email: string; whatsapp: string; notes: string | null };
  pageOrigin: string | null;
};

export function buildLeadEmail(input: LeadEmailInput): { subject: string; html: string; text: string } {
  const { audience, serviceTag, reportTitle, estimatedMin, estimatedMax, inclusions, timeline, lead, pageOrigin } = input;

  const avg = estimatedMin != null && estimatedMax != null
    ? Math.round(((estimatedMin + estimatedMax) / 2) / 100) * 100
    : null;
  const range = estimatedMin != null && estimatedMax != null
    ? `${fmtBRL(estimatedMin)} – ${fmtBRL(estimatedMax)}`
    : null;

  const protocol = `#NTK-${Math.abs(hashString(JSON.stringify({ serviceTag, lead, inclusions }))) % 9000 + 1000}`;
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const wppDigits = lead.whatsapp.replace(/\D/g, '');
  const wppLink = `https://wa.me/${wppDigits}`;

  const subject = audience === 'internal'
    ? `[Notkode] Lead novo · ${serviceTag} · ${lead.name}`
    : `Sua proposta preliminar · ${reportTitle}`;

  // ── HTML ──
  const header = `
    <div style="padding:18px 28px;border-bottom:1px solid rgba(0,0,0,0.06);background:rgba(25,25,24,0.025);display:flex;justify-content:space-between;align-items:center">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#666">
        proposta-preliminar.${serviceTag}
      </div>
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;color:#999">
        ${protocol} · ${today}
      </div>
    </div>`;

  const heroValue = `
    <div style="padding:36px 28px 28px;text-align:center;background:linear-gradient(180deg,rgba(59,130,246,0.05) 0%,transparent 100%);border-bottom:1px solid rgba(0,0,0,0.06)">
      <h1 style="font-size:24px;font-weight:600;color:#191918;letter-spacing:-0.02em;margin:0 0 24px">${escapeHtml(reportTitle)}</h1>
      ${avg != null && range ? `
        <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6;margin-bottom:10px">
          ❯ investimento médio estimado
        </div>
        <div style="font-size:38px;font-weight:700;color:#191918;letter-spacing:-0.025em;line-height:1">${fmtBRL(avg)}</div>
        <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:11px;color:#999;margin-top:10px">faixa ${range}</div>
      ` : `
        <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6">
          ❯ esboço preliminar
        </div>
      `}
    </div>`;

  const contactBlock = audience === 'internal' ? `
    <div style="padding:20px 28px;border-bottom:1px solid rgba(0,0,0,0.06);background:rgba(59,130,246,0.04)">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#3b82f6;margin-bottom:10px">❯ contato do lead</div>
      <div style="font-size:18px;font-weight:600;color:#191918;margin-bottom:6px">${escapeHtml(lead.name)}</div>
      <table style="border-collapse:collapse;font-size:13px">
        <tr><td style="padding:2px 14px 2px 0;color:#666;white-space:nowrap">E-mail</td><td style="padding:2px 0"><a href="mailto:${escapeHtml(lead.email)}" style="color:#3b82f6;text-decoration:none">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding:2px 14px 2px 0;color:#666;white-space:nowrap">WhatsApp</td><td style="padding:2px 0"><a href="${wppLink}" style="color:#3b82f6;text-decoration:none">${escapeHtml(lead.whatsapp)}</a></td></tr>
        ${pageOrigin ? `<tr><td style="padding:2px 14px 2px 0;color:#666;white-space:nowrap">Origem</td><td style="padding:2px 0;color:#666;font-size:12px">${escapeHtml(pageOrigin)}</td></tr>` : ''}
      </table>
    </div>` : '';

  const inclusionsBlock = inclusions.length > 0 ? `
    <div style="padding:24px 28px;border-bottom:1px solid rgba(0,0,0,0.06)">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin-bottom:16px">❯ o que está incluído</div>
      ${inclusions.map((g) => `
        <div style="margin-bottom:18px">
          <div style="font-weight:600;font-size:14px;color:#191918;margin-bottom:8px">${escapeHtml(g.title)}</div>
          <ul style="margin:0;padding:0;list-style:none">
            ${g.items.map((it) => `
              <li style="padding:3px 0 3px 18px;position:relative;font-size:13px;color:#444;line-height:1.5">
                <span style="position:absolute;left:0;top:5px;color:#3b82f6;font-weight:700">✓</span>
                ${escapeHtml(it)}
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>` : '';

  const timelineBlock = timeline.length > 0 ? `
    <div style="padding:24px 28px;border-bottom:1px solid rgba(0,0,0,0.06);background:rgba(25,25,24,0.02)">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin-bottom:16px">❯ cronograma estimado</div>
      <table style="border-collapse:collapse;width:100%">
        ${timeline.map((p, i) => `
          <tr>
            <td style="padding:8px 16px 8px 0;vertical-align:top;white-space:nowrap;border-left:2px solid #3b82f6;padding-left:14px">
              <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#3b82f6;margin-bottom:2px">${escapeHtml(p.range)}</div>
              <div style="font-weight:600;font-size:14px;color:#191918">${escapeHtml(p.title)}</div>
            </td>
            <td style="padding:8px 0;vertical-align:top;font-size:13px;color:#666;line-height:1.5">${escapeHtml(p.desc)}</td>
          </tr>
          ${i < timeline.length - 1 ? '<tr><td colspan="2" style="height:4px"></td></tr>' : ''}
        `).join('')}
      </table>
    </div>` : '';

  const notesBlock = lead.notes ? `
    <div style="padding:20px 28px;border-bottom:1px solid rgba(0,0,0,0.06)">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin-bottom:8px">❯ notas ${audience === 'lead' ? 'que você adicionou' : 'do lead'}</div>
      <div style="font-size:14px;line-height:1.55;color:#333;white-space:pre-wrap">${escapeHtml(lead.notes)}</div>
    </div>` : '';

  const leadIntro = audience === 'lead' ? `
    <div style="padding:22px 28px;border-bottom:1px solid rgba(0,0,0,0.06)">
      <div style="font-size:15px;line-height:1.6;color:#333">
        Oi, ${escapeHtml(lead.name.split(' ')[0] || lead.name)}.<br><br>
        Esse é o <strong>esboço do seu projeto</strong> que você acabou de montar no site da Notkode. A gente já está olhando aqui e vai te chamar pelo WhatsApp pra validar o escopo e fechar o investimento exato com base no contexto da sua operação.<br><br>
        Resposta em até <strong>24 horas</strong>.
      </div>
    </div>` : '';

  const footer = audience === 'lead' ? `
    <div style="padding:20px 28px;background:rgba(25,25,24,0.02);text-align:center">
      <div style="font-size:13px;color:#666;line-height:1.6">
        Qualquer coisa, é só responder esse e-mail — chega direto na nossa caixa.
      </div>
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin-top:10px">
        ❯ equipe notkode
      </div>
    </div>` : `
    <div style="padding:14px 28px;background:rgba(25,25,24,0.02);font-family:'JetBrains Mono',Menlo,monospace;font-size:10px;color:#999;letter-spacing:0.1em;text-transform:uppercase;display:flex;justify-content:space-between">
      <span>registrado ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
      <span>reply-to: ${escapeHtml(lead.email)}</span>
    </div>`;

  const html = `
<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#fffef2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#191918">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:14px;overflow:hidden">
    ${header}
    ${contactBlock}
    ${leadIntro}
    ${heroValue}
    ${inclusionsBlock}
    ${timelineBlock}
    ${notesBlock}
    ${footer}
  </div>
</body>
</html>`.trim();

  // ── Plain text fallback ──
  const textLines: string[] = [];
  textLines.push(reportTitle);
  textLines.push('─'.repeat(reportTitle.length));
  textLines.push('');
  if (audience === 'lead') {
    textLines.push(`Oi, ${lead.name.split(' ')[0]}.`);
    textLines.push('');
    textLines.push('Esse é o esboço do seu projeto. A gente já está olhando e vai te chamar pelo WhatsApp pra validar.');
    textLines.push('');
  } else {
    textLines.push(`Lead: ${lead.name}`);
    textLines.push(`E-mail: ${lead.email}`);
    textLines.push(`WhatsApp: ${lead.whatsapp} (${wppLink})`);
    if (pageOrigin) textLines.push(`Origem: ${pageOrigin}`);
    textLines.push('');
  }
  if (avg != null && range) {
    textLines.push(`Investimento médio estimado: ${fmtBRL(avg)}`);
    textLines.push(`Faixa: ${range}`);
    textLines.push('');
  }
  if (inclusions.length > 0) {
    textLines.push('O que está incluído:');
    for (const g of inclusions) {
      textLines.push(`  ${g.title}:`);
      for (const it of g.items) textLines.push(`    ✓ ${it}`);
    }
    textLines.push('');
  }
  if (timeline.length > 0) {
    textLines.push('Cronograma:');
    for (const p of timeline) textLines.push(`  ${p.range} — ${p.title}: ${p.desc}`);
    textLines.push('');
  }
  if (lead.notes) {
    textLines.push('Notas:');
    textLines.push(lead.notes);
  }

  return { subject, html, text: textLines.join('\n') };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}
