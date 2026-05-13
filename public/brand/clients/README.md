# Logos de clientes — Notkode

Dropar os arquivos de logo dos clientes aqui. Quando uploadar, me avise os nomes finais e eu ligo no componente.

## Formato recomendado

- **Tipo:** SVG (preferido) ou PNG com fundo transparente
- **Altura visual:** ~40px (o componente renderiza em `h-8` = 32px)
- **Cor:** Versão branca/clara (fundo é escuro). Se o logo do cliente é colorido, prefira a versão monocromática branca.
- **Padding interno do SVG:** Sem padding (deixe o logo tocar as bordas do viewBox)

## Naming convention (kebab-case)

| Cliente | Filename esperado |
|---|---|
| Azure Investimentos | `azure-investimentos.svg` |
| AutoAgentes | `autoagentes.svg` |
| Noodrops | `noodrops.svg` |
| Ponto Patta | `ponto-patta.svg` |
| Solojet Aviação | `solojet.svg` |
| ZapInside | `zapinside.svg` |
| Agência Cotton | `cotton.svg` |
| Peki Marketing | `peki.svg` |
| Loss Prevention | `loss-prevention.svg` |
| Blindy | `blindy.svg` |
| Receba Seus Direitos | `receba-seus-direitos.svg` |

Pode subir só alguns — os que não tiverem arquivo aparecem como texto em monospace (que também fica elegante).

## Como ativar um logo

No arquivo `src/components/home/logo-strip.tsx`, mude o `logo: undefined` para o caminho:

```ts
{ name: 'Azure Investimentos', logo: '/brand/clients/azure-investimentos.svg' },
```

Quando você uploadar e me avisar, eu atualizo o componente de uma vez.
