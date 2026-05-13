# Notkode — Site oficial

Next.js 15 + App Router + TypeScript + Tailwind CSS + next-intl (PT/EN).

## Pré-requisitos

- Node.js 20+
- pnpm 9+ (ou bun, npm, yarn — pnpm é o usado neste projeto)

## Como rodar

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # build de produção
pnpm start        # serve o build
pnpm typecheck    # valida tipos
pnpm lint         # ESLint
```

A Home redireciona automaticamente para `/pt` ou `/en` com base no header `Accept-Language`.

---

## Estrutura

```
.
├── _legacy/                 # Código do site antigo (Vite) — somente referência
├── _brand-manual/           # PDF + ativos originais da marca
├── _design-system/          # design-system.html (visual reference)
├── messages/                # i18n
│   ├── pt.json
│   └── en.json
├── public/
│   ├── brand/
│   │   ├── logos/           # 4 variantes (horizontal/vertical × light/dark)
│   │   ├── patterns/        # light · cyan · dark
│   │   └── carinha.png      # mascote
│   ├── fonts/               # Sora.ttf + AcuminProWide.otf
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx       # root layout (pass-through)
│   │   ├── globals.css      # tokens + @font-face + utilitários
│   │   └── [locale]/
│   │       ├── layout.tsx   # layout com Header/Footer + IntlProvider
│   │       ├── page.tsx     # Home
│   │       ├── sistemas-ia/page.tsx    # flagship
│   │       ├── parcerias/page.tsx
│   │       ├── cases/page.tsx
│   │       ├── sobre/page.tsx
│   │       ├── contato/page.tsx
│   │       └── blog/page.tsx
│   ├── components/
│   │   ├── ui/              # Button, Card, Input/Textarea/Label, Badge
│   │   ├── brand/           # Logo, CarinhaFloat
│   │   └── layout/          # Header, Footer, LanguageToggle
│   ├── i18n/
│   │   ├── routing.ts       # locales + pathnames localizados
│   │   └── request.ts       # carrega messages por requisição
│   └── lib/
│       └── utils.ts         # cn() helper
├── middleware.ts            # next-intl middleware (locale routing)
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Design system

Toda a referência visual está em **`_design-system/design-system.html`** — abra no navegador para conferir paleta, tipografia, componentes, patterns e animações.

### Tokens principais

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#4BD2E5` | Ciano principal — CTAs, accents |
| `primary-soft` | `#8EE2E5` | Ciano suave — secundário |
| `navy` | `#131520` | Background principal (dark) |
| `neutral.*` | rampa 0–950 | Hierarquia de cinzas |
| `cyan.*` | rampa 50–900 | Variações do ciano |
| `success/warning/danger` | semânticas | Estados |

### Tipografia

- **Sora** (variável 100–800) — display + body. Auto-aplicada em `h1-h6`.
- **Acumin Pro Wide** (Adobe) — labels, eyebrows, meta. ⚠ Requer licença Adobe Fonts para produção.

### Classes utilitárias customizadas

```css
.text-gradient    /* texto com gradient brand */
.glass            /* fundo translúcido + blur leve */
.glass-strong     /* fundo translúcido mais opaco */
.eyebrow          /* label pequeno em uppercase */
```

### Animações

```css
animate-float-soft       /* flutuação suave +rotação */
animate-float-soft-alt   /* flutuação suave -rotação */
animate-gentle-pulse     /* scale suave 1 ↔ 1.02 */
animate-fade-up          /* fade + slide up */
animate-glow-pulse       /* glow pulsante ciano */
```

---

## i18n

- Idiomas: `pt` (default) e `en`
- Locale prefix: `as-needed` — URL sem prefixo carrega o default
- Pathnames localizados em `src/i18n/routing.ts`:
  - `/sistemas-ia` (PT) ⇄ `/ai-systems` (EN)
  - `/parcerias` ⇄ `/partners`
  - `/sobre` ⇄ `/about`
  - `/contato` ⇄ `/contact`
  - `/agentes-automacao` ⇄ `/ai-agents-automation` (rota planejada)
  - `/produtos-digitais` ⇄ `/digital-products` (rota planejada)

Para adicionar/traduzir conteúdo: editar `messages/pt.json` e `messages/en.json` em paralelo.

Para criar uma nova rota:
1. Adicione em `src/i18n/routing.ts` no objeto `pathnames`
2. Crie `src/app/[locale]/<rota>/page.tsx`
3. Adicione strings em `messages/pt.json` e `messages/en.json`

---

## Componentes prontos para uso

```tsx
// Button
import { Button } from '@/components/ui/button';
<Button variant="primary" size="lg">Agendar diagnóstico</Button>
// variants: primary | secondary | outline | ghost | whatsapp
// sizes: sm | md | lg

// Card
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
<Card variant="glass" padding="md" hover>
  <CardTitle>Título</CardTitle>
  <CardDescription>Descrição</CardDescription>
</Card>
// variants: solid | glass | feature

// Input / Textarea / Label
import { Input, Textarea, Label } from '@/components/ui/input';

// Badge
import { Badge } from '@/components/ui/badge';
<Badge variant="primary">Em destaque</Badge>

// Logo
import { Logo } from '@/components/brand/logo';
<Logo variant="horizontal-white" width={140} priority />

// CarinhaFloat (para heros)
import { CarinhaFloat } from '@/components/brand/carinha-float';
<CarinhaFloat />  // 7 carinhas espalhadas com animação default
```

---

## Próximos passos sugeridos

A estrutura está pronta. As páginas têm apenas placeholders. Sequência recomendada:

1. **Home** (`src/app/[locale]/page.tsx`) — completar com logo bar, grid de 3 serviços, flagship feature, portfolio, depoimentos, agency entry, CTA final
2. **`/sistemas-ia`** (flagship) — hero + Tool Chaos Index + ROI calculator + módulos + case + FastForge + FAQ + CTA com formulário multi-step
3. **`/contato`** — formulário multi-step que bifurca para WhatsApp / Calendar / e-mail
4. **`/cases`** — grid com filtros, integrando os 3 novos cases pendentes (Loss Prevention, Blindy, Receba Seus Direitos)
5. **`/sobre`** — timeline + fundadores
6. **`/parcerias`** — versão refinada da página atual
7. **`/blog`** — sistema de posts (decidir se MDX local, CMS headless, etc.)

---

## Notas importantes

- **Acumin Pro Wide** está em `public/fonts/` mas é licenciado pela Adobe. Em produção, ou use Adobe Fonts (kit JS), ou substitua por uma alternativa (ex: Sora 500 com letter-spacing aumentado). Veja a discussão no design system.
- **Acesse os cases salvos** em `~/.claude/projects/-Users-camila-Documents-repo-notkode/memory/project_new_cases_pending.md` para os novos cases (Loss Prevention, Blindy, Receba Seus Direitos).
- **CNPJ, contato e dados oficiais** já estão no rodapé (i18n).
- **Modo escuro é o padrão** — light mode tem tokens preparados mas não está ativado por padrão (basta adicionar `class="light"` no `<html>`).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Linguagem | TypeScript 5.7 (strict) |
| Estilo | Tailwind CSS 3.4 + CSS variables |
| i18n | next-intl 3.26 com pathnames localizados |
| Componentes | Custom (cva + clsx + tailwind-merge) |
| Ícones | lucide-react |
| Fontes | Sora (local) + Acumin Pro Wide (local, Adobe) |
| Imagens | next/image |

---

Construído seguindo o manual oficial de identidade visual da Notkode (`_brand-manual/APRESENTAÇÃO/IDENTIDADE_VISUAL_NOTKODE.pdf`).
