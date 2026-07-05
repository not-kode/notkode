# Notkode — Identidade Visual v2

**Estilo:** Editorial analógico-tech — *"uma máquina antiga imprimindo algo elegante"*.
Não é interface de terminal nem videogame: é editorial, impresso, com toque técnico.

Princípios: alto contraste (sem meio-termo), superfícies **chapadas** (sem sombra/gradiente/card
elevado), muito espaço, tipografia grande dominando, **um único acento** (azul da marca),
textura vinda de **imagem tratada** (dithering/halftone) e **ASCII** decorativo.

---

## 1. Cores

Paleta enxuta: papel + tinta + **um acento azul**. Nada de cores múltiplas.

| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#F3EDDC` | Fundo (papel bege quente — o "amarelo" da marca) |
| `--paper-2` | `#ECE4CF` | Banda/seção alternada chapada |
| `--ink` | `#1A1611` | Texto e traço (tinta quase-preta, quente) |
| `--ink-2` | `#4B4536` | Texto secundário |
| `--muted` | `#8C8470` | Metadata, labels, eixos |
| `--blue` | `#3B82F6` | **Acento único** — destaque, "hoje", sol, CTA, foco |
| `--blue-2` | `#1D4ED8` | Azul profundo p/ **texto pequeno** (contraste no papel) |
| `--cyan` | `#4BD2E5` | **Só o ícone (sorrisinho)** — discreto, opcional |

Linhas/filetes: `rgba(26,22,17,0.22)` (forte) e `rgba(26,22,17,0.11)` (sutil).

**Regras de contraste (obrigatórias):**
- Texto pequeno em azul → use `--blue-2` (#1D4ED8), nunca `--blue` puro sobre papel.
- Destaque azul sobre imagem → **selo** (fundo `--blue`, texto `--ink`), nunca texto azul solto.
- `--blue` puro só em: áreas grandes, "hoje" do gráfico, o sol da imagem, foco.

```css
:root{
  --paper:#F3EDDC; --paper-2:#ECE4CF;
  --ink:#1A1611; --ink-2:#4B4536; --muted:#8C8470;
  --blue:#3B82F6; --blue-2:#1D4ED8; --cyan:#4BD2E5;
  --line:rgba(26,22,17,0.22); --line-2:rgba(26,22,17,0.11);
}
```

---

## 2. Tipografia — três vozes

| Papel | Fonte | Onde |
|---|---|---|
| **Principal** | **JetBrains Mono** | Títulos, corpo, navegação, botões — o ar técnico |
| **Destaque** | **Parabole** | **Só palavras-âncora** (1 por frase). Nunca em texto corrido |
| **Números** | **Fraunces** (serifada) | Só algarismos: KPIs, valores, preços |

> Regra de ouro: Parabole em tudo fica pesado — use com parcimônia, só no destaque.
> Sora (do manual) fica como alternativa de display, mas a v2 adota JetBrains como base.

**Escala** (títulos JetBrains, peso 700, `letter-spacing:-.02em`):
- H1 hero: `clamp(2.1rem, 5vw, 3.5rem)`
- H2 seção: `clamp(1.4rem, 3vw, 2rem)`
- Corpo: 15px, `line-height:1.6`
- Label/metadata (mono): 10.5px, `letter-spacing:.14em`, UPPERCASE
- Número (Fraunces): peso 560, `font-variation-settings:'opsz' 144`, `tabular-nums`

Fontes: JetBrains Mono e Fraunces via Google Fonts; Parabole já está em `public/fonts/`.

---

## 3. Superfícies & layout

- **Chapado sempre**: sem `box-shadow`, sem gradiente de card, sem elevação. Só filetes.
- **Filetes finos** dividindo seções e blocos (1px `--line`).
- **Espaço generoso**: seções `clamp(46px,7vw,80px)` de padding vertical.
- **Metadata técnica nos cantos**: coordenadas (`23°33′S · 46°38′W`), contadores (`DOC 03/08`,
  `FIG. 01`), timestamps (`ED. MAI · 2025`), unidades (`1-BIT`, `120 LPI`).
- **Headers com letras espaçadas**: `S I S T E M A S   C O M   I A` (mono, `letter-spacing:.3em`).
- **Prompt de terminal** `❯` como marcador ocasional (discreto, editorial — não "gamer").

---

## 4. Componentes

**Botão primário** — bloco de tinta chapado:
`background:var(--ink); color:var(--paper); mono 12px; padding:10px 15px;` + `↗` na frente.

**Selo de destaque** (o "futuro") — pílula azul:
`background:var(--blue); color:var(--ink); border-radius:999px; padding:.04em .5em;`
`-webkit-box-decoration-break:clone;` (para quebrar em 2 linhas).

**Eyebrow/label**: mono, uppercase, `--muted`, `letter-spacing:.2em`, com `❯` opcional.

**KPI**: label mono (`--muted`) + número **Fraunces** grande + delta mono com seta
(`▲` sobe = ink/bold, `▼` cai = muted). A seta usa `--blue-2`. Sem semáforo verde/vermelho forte.

**Foco (acessibilidade)**: `outline:2px solid var(--blue); outline-offset:3px;`

---

## 5. Visualização de dados

- Gráfico de barras: barras em `--ink`; **"hoje"/destaque em `--blue`** com valor rotulado.
- Eixo Y (2–3 ticks) e grade discreta (`rgba(26,22,17,0.14)`), baseline mais forte.
- Rótulos e eixos em **mono** `--muted`; números em Fraunces.
- Variação: seta + peso, não só cor.
- **Hover** com tooltip (fundo `--ink`, texto papel) mostrando o número exato.
- Tudo chapado, sem sombra.

---

## 6. Movimento (sutil e proposital)

- **Halftone interativo** (o orbe de pontos): o realce **azul acompanha o mouse na tela inteira**,
  preso à borda do disco, com **easing baixo (~0.075)** e **borda suave (smoothstep)** — glide fluido.
  Sem mouse: deriva lenta. Respeita `prefers-reduced-motion`.
- **Sol da imagem**: pulso **bem lento e sutil** (respira no azul, ~0.8 rad/s, amplitude pequena).
- Nada de varredura/scanline/glitch agressivo. Menos é mais.

---

## 7. PADRÃO DE IMAGENS  ⭐ (para gerar no Freepik)

Toda imagem passa por **um** destes tratamentos, sempre em **duotone papel+tinta com 1 acento azul**:

**A) Dithering 1-bit (engraving)** — o principal. Cena vira pontos pretos sobre o papel,
com uma região em azul (sol/foco). Cara de gravura/impressão antiga.
**B) Halftone** — grade de pontos que variam de tamanho (o orbe). Bom p/ formas/esferas.
**C) ASCII** — imagem convertida em caracteres, decoração ocasional.
**D) Vulto circular** — recortar a imagem tratada num **disco** (curvas da marca).

### Como gerar no Freepik (Mystic/Flux)
Gere em **preto e branco de alto contraste / estilo gravura** e depois aplique o duotone.
Prompts prontos (use em inglês no gerador):

> **Hero / abstração tech**
> `high-contrast 1-bit dithered illustration, floyd-steinberg halftone, engraving of an abstract mountain landscape with a glowing sun, monochrome black ink on cream paper, retro print texture, minimal, lots of negative space, editorial, no text`

> **Contexto de produto / operação**
> `dithered halftone engraving of hands using a laptop / dashboard, 1-bit black and white, risograph print texture, vintage newspaper print, high contrast, cream background, minimalist editorial composition, no text`

> **Textura / esfera**
> `halftone dot gradient sphere, orb of dots, black ink on cream paper, 1-bit, print texture, centered, minimal`

> **Retrato (equipe/cliente)**
> `portrait, heavy 1-bit dithering, engraving stipple style, black on cream, high contrast, editorial magazine print, grainy, minimal`

**Parâmetros de estilo (palavras-chave):** `1-bit`, `dithering`, `floyd-steinberg`, `halftone`,
`engraving`, `risograph`, `stipple`, `monochrome`, `high contrast`, `cream and black`,
`vintage print`, `editorial`, `negative space`, `no text`.

**Sempre:** peça **monocromático/alto contraste** e **sem texto**. Evite: cores múltiplas,
gradientes suaves, fotos realistas coloridas, 3D brilhante.

### Pós-processamento (aplicar o padrão)
1. Converter p/ P&B alto contraste.
2. Aplicar **dithering** (Floyd–Steinberg) — no código já temos o algoritmo (ver o mock);
   ou no Photoshop: *Image > Mode > Bitmap > Diffusion Dither*; no GIMP: *Image > Mode > Indexed > B/W + dithering*.
3. **Duotone**: preto → `--ink #1A1611`, branco → `--paper #F3EDDC`.
4. Pintar a região de foco (sol) em `--blue #3B82F6`.
5. Opcional: recortar em **disco** (vulto circular).

---

## 8. Do's & Don'ts

✅ Papel + tinta + 1 azul · superfícies chapadas · Parabole só no destaque · números em Fraunces ·
imagens sempre dithered/halftone duotone · metadata técnica nos cantos · movimento sutil.

❌ Sombras/cards elevados · cores múltiplas · azul claro/lavado em texto · Parabole em texto corrido ·
fotos coloridas realistas · glitch/scanline agressivo · gradientes suaves em imagem.

---

## 9. Checklist de aplicação no site

- [ ] Trocar tokens em `globals.css` + `tailwind.config.ts` pela paleta acima (uma fonte de verdade).
- [ ] Fontes: adicionar Fraunces + JetBrains Mono; Parabole já existe. Definir os 3 papéis.
- [ ] Remover sombras/elevações; adotar filetes finos.
- [ ] Herói: título JetBrains + destaque em selo/Parabole; halftone interativo à direita.
- [ ] Substituir imagens por versões dithered/halftone duotone (padrão da seção 7).
- [ ] Reestilizar dashboard/gráficos conforme seção 5.
- [ ] Adicionar metadata técnica nos cantos + eyebrows com letras espaçadas.
- [ ] Passar acessibilidade: contraste (seção 1) + foco visível + `prefers-reduced-motion`.

*Referência viva: o mock interativo publicado (halftone que segue o mouse, imagem dithered, ASCII).*
