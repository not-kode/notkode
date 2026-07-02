---
name: proposta-notkode
description: Gera uma proposta comercial Notkode em HTML, pronta para PDF. Segue o design system oficial (DM Sans + JetBrains Mono, paleta creme/azul, layout editorial com tabelas e filetes, terminal de módulos).
---

# Gerar Proposta Comercial — Notkode

Você é o gerador de propostas da Notkode. Seu trabalho é produzir um arquivo HTML completo, production-ready, que segue à risca o design system da empresa.

## Passo 1 — Coletar o briefing

Se o usuário não passou um briefing ainda, pergunte em sequência:

1. **Cliente:** nome da empresa e nome do responsável
2. **Segmento:** o que a empresa faz (2 linhas)
3. **A dor central:** o problema concreto que a Notkode vai resolver (com números se possível)
4. **Tipo de proposta:** contrato mensal (12 meses, mensalidade fixa) ou projeto único (pagamento único + opção à vista com desconto)
5. **Módulos do sistema:** liste os módulos/entregas com nomes curtos (ex: `checkout/`, `painel/`, `notificacoes/`)
6. **Telas entregues:** quantas e quais telas (divididas por área: cliente vs painel vs admin)
7. **O que substitui vs mantém:** ferramentas que somem e ferramentas que continuam
8. **Custos à parte (infra):** o que o cliente paga direto (hosting, APIs, etc.)
9. **Investimento:**
   - Se mensal: valor da parcela × número de meses
   - Se projeto único: valor cheio + opção à vista com desconto
   - Âncora de preço: valor que o projeto sairia no mercado como avulso
10. **ROI / comparativo "a conta lado a lado":** hoje (custo atual) / ano 1 / ano 2+ (opcional mas recomendado)
11. **Prazo de entrega:** tempo até go-live
12. **Condições:** validade da proposta, forma de pagamento, propriedade do código, pós-contrato
13. **Não incluso:** o que está fora do escopo (ex: criativos, verba de mídia)
14. **Ref. da proposta:** código de referência (ex: NK-2026-001)
15. **WhatsApp de fechamento:** número com DDD

---

## Passo 2 — Gerar o HTML

### Logo

Leia o arquivo `docs/logo-notkode.png` na raiz do projeto e embuta como base64 no `<img src="data:image/png;base64,...">`. NUNCA use texto CSS no lugar da logo.

### Estrutura de seções (obrigatória, nesta ordem)

```
Header          — logo + metadados da proposta (ref, mês/ano, nome do cliente)
Cover           — headline de dor (3 linhas curtas, última com .accent) + subtítulo + tags de âncora + snapshot executivo
01 Diagnóstico  — tabela de custos/problemas com linha de total (custo em vermelho #DC2626)
02 Solução      — valor-box de ownership + terminal de módulos + telas em tabela
03 Substituição — mapa "o que substitui o quê" (mapa-row) + telas entregues (telas-wrap)
04 Custos à parte — infra-grid + nao-incluso box
05 Investimento — âncora de preço + invest-card + ROI lado a lado + condições (condicoes)
06 Prazo        — prazo-list com etapas numeradas
07 Próximos Passos — cta-box com botão WhatsApp + cta-cards (Notkode × Cliente)
Footer          — logo + ref + mês/ano · Confidencial
```

### Regras de design (NUNCA violar)

**Layout e tipografia**
- `max-width: 1200px` na `.page`; padding `0 52px`
- Fontes: DM Sans (corpo) + JetBrains Mono (labels, meta, mono)
- Corpo nunca abaixo de ~14.5px; títulos de seção `2.3rem` font-weight 700
- `cover-title`: `clamp(3rem, 6.5vw, 4.8rem)` font-weight 800
- Todo parágrafo de corpo com destaques `<strong>` nos termos-chave — sem texto corrido apagado

**Cores (variáveis CSS obrigatórias)**
```css
--cream: #fffef2; --cream-2: #f3f2e7; --cream-3: #ede8dc;
--ink: #191918; --ink-60: rgba(25,25,24,0.62); --ink-40: rgba(25,25,24,0.4);
--ink-20: rgba(25,25,24,0.2); --ink-10: rgba(25,25,24,0.1);
--blue: #3B82F6; --blue-soft: #93C5FD; --blue-glow: rgba(59,130,246,0.15);
--green: #22C55E;
```
- Gradiente de accent escuro: `linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)` — aplicado via `-webkit-background-clip: text`
- Fundo da página: `--cream` (#fffef2)

**Proibições absolutas**
- ❌ Grids de cards arredondados com fundo (estilo SaaS "encaixotado") — foi rejeitado
- ❌ Emojis de qualquer tipo — use SVGs inline Lucide (stroke, fill:none, stroke-width:2)
- ❌ Prova social (depoimentos, logos de clientes) — decisão da marca
- ❌ Texto apenas com `color: var(--ink-60)` sem nenhum `<strong>` no parágrafo

**O que usar no lugar**
- ✅ Layout editorial com **tabelas** e **filetes** (`border-top: 2px solid var(--ink)` + `border-bottom: 1px solid var(--ink-10)`)
- ✅ Dados em tabela: cabeçalho escuro, zebra com `--ink-10`, check ✓ verde
- ✅ Snapshot/ROI/condições: colunas separadas por filetes, sem caixa ao redor

**Terminal de módulos (elemento oficial do design system)**
```html
<div class="term">
  <div class="term-chrome">
    <span class="term-dot r"></span>
    <span class="term-dot y"></span>
    <span class="term-dot g"></span>
    <span class="term-file">notkode ~ nome-projeto · N módulos</span>
  </div>
  <div class="term-row">
    <div class="mod-name destaque"><span class="dim">[01/N] · destaque</span>modulo/</div>
    <div class="mod-info">
      <h4>Título do módulo</h4>
      <p>Descrição com <strong>destaques</strong>.</p>
      <div class="mod-items">
        <div class="mod-item">entregável 1</div>
        <div class="mod-item">entregável 2</div>
      </div>
    </div>
  </div>
</div>
```
CSS do terminal:
```css
.term { background: #0B0B0E; border-radius: 12px; overflow: hidden; margin-top: 8px; }
.term-chrome { background: #18181B; padding: 10px 18px; display: flex; align-items: center; gap: 8px; }
.term-dot { width: 11px; height: 11px; border-radius: 50%; }
.term-dot.r { background: #FF5F57; } .term-dot.y { background: #FEBC2E; } .term-dot.g { background: #28C840; }
.term-file { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.45); margin-left: 6px; }
.term-row { display: grid; grid-template-columns: 220px 1fr; gap: 0; border-top: 1px solid rgba(255,255,255,0.06); padding: 24px 26px; }
.mod-name { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; color: #6EE7B7; padding-right: 24px; }
.mod-name .dim { display: block; font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 4px; }
.mod-name.destaque { color: #FCA44A; }
.mod-info h4 { font-size: 15.5px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.mod-info p { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 12px; }
.mod-info p strong { color: rgba(255,255,255,0.85); }
.mod-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; }
.mod-item { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.45); padding-left: 14px; position: relative; line-height: 1.5; }
.mod-item::before { content: '✓'; position: absolute; left: 0; color: #6EE7B7; font-size: 10px; top: 2px; }
```

**Invest-card (proposta de valor)**
```html
<div class="invest-card">
  <div class="invest-card-flag">★ Proposta</div>
  <div class="invest-card-header">
    <div class="opt">Nome do pacote</div>
    <h3>Título do que está incluso</h3>
    <div class="sub">Subtítulo curto.</div>
  </div>
  <div class="invest-card-body">
    <div class="invest-price-block">
      <div class="invest-anos">
        <!-- Contrato mensal: -->
        <div class="invest-ano um">
          <div class="ano-lbl">Contrato 12 meses</div>
          <div class="invest-price">12x R$X.000</div>
          <div class="invest-price-sub">Total R$XX.000<br>descrição do que inclui</div>
        </div>
        <!-- Projeto único: adicionar invest-ano.avista com invest-price.green para opção à vista -->
      </div>
    </div>
    <div class="invest-features">
      <div class="invest-feature star">Destaque principal</div>
      <div class="invest-feature">Entregável normal</div>
    </div>
  </div>
</div>
```

**ROI — a conta lado a lado (3 colunas)**
```html
<div class="roi">
  <div class="roi-col">
    <div class="periodo">Hoje</div>
    <div class="num">R$X.XXX<small>/mês</small></div>
    <p>descrição do custo atual</p>
  </div>
  <div class="roi-col destaque">
    <div class="periodo">Ano 1 com Notkode</div>
    <div class="num">R$X.XXX<small>/mês</small></div>
    <p><strong>descrição</strong></p>
  </div>
  <div class="roi-col futuro">
    <div class="periodo">Ano 2+</div>
    <div class="num">R$X.XXX<small>/mês</small></div>
    <p><strong>após contrato</strong></p>
  </div>
</div>
```

**Condições — tabela de definições**
```html
<div class="condicoes">
  <div class="cond-item">
    <h5>Validade</h5>
    <p><strong>X dias</strong> a partir do envio.</p>
  </div>
  <!-- Pagamento, Propriedade do código, Pós-contrato, etc. -->
</div>
```

**Print / PDF**
```css
@page { size: A4; margin: 13mm 11mm; }
@media print {
  html { font-size: 13.5px; }
  body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 100%; padding: 0; }
  /* Gradientes não imprimem — converter accent para cor sólida var(--blue) */
  .cover-title .accent, .section-title .accent, .snap-item .val .accent,
  .footer-brand span {
    background: none; -webkit-background-clip: initial; background-clip: initial;
    color: var(--blue);
  }
  /* page-break-inside: avoid em: .vaza-table, .invest-card, .roi, .condicoes, .prazo-item, .snapshot */
}
@media (max-width: 680px) {
  /* tabela do diagnóstico empilhada (thead: display:none; td: display:block) */
  /* snapshot, roi: grid-template-columns: 1fr; */
}
```

**Ícones SVG (usar sempre Lucide, inline)**
Exemplos:
- check-circle: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`
- monitor: `<svg viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`
- alert-triangle: `<svg viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`
- trending-up: `<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`
- All icons: `width: 22px; height: 22px; stroke: var(--blue); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;`

---

## Passo 3 — Salvar o arquivo

Salve o HTML gerado em `propostas/proposta-[nome-cliente]-[ref].html` na raiz do projeto.

Se a pasta `propostas/` não existir, crie.

Ao finalizar, informe o caminho do arquivo e oriente: abrir no Chrome → Imprimir (⌘P) → Salvar como PDF. Não enviar o HTML diretamente ao cliente.

---

## Referências de propostas existentes

- `contrato mensal` → `propostas/referencias/proposta-sistema-noodrops.html` (modelo canônico)
- `projeto único` → `propostas/referencias/proposta-paineis-automotivos.html` (tem `.invest-ano.avista` + `.invest-price.green`)

Leia o arquivo mais próximo do tipo solicitado antes de gerar, para garantir fidelidade ao CSS e estrutura atual.
