import type { ReactNode } from 'react';

/**
 * O cabeçalho de toda tela do CRM: o nome da página, e nada de frase explicando
 * o que ela faz — quem está dentro do sistema já sabe. Cada tela tinha o seu
 * jeito (uma com etiqueta em cima, outra com subtítulo, outra sem nada), e o
 * conjunto parecia sete produtos diferentes.
 *
 * `dados` é a exceção que vale: número da própria tela (quantos clientes, quantas
 * gravações). Aparece ao lado do título, como informação, não como legenda.
 * `children` é o que a tela precisa na ponta direita: filtro de período, botão
 * de criar.
 */
export function PageHeader({ titulo, dados, children, className = 'mb-5' }: {
  titulo: string;
  dados?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-medium tracking-tight text-text-primary">{titulo}</h1>
        {dados && <PageData>{dados}</PageData>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** O número da tela, ao lado do título. */
export function PageData({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-black/[0.04] px-2.5 py-1 font-label text-[11px] uppercase tracking-wider text-text-muted">
      {children}
    </span>
  );
}
