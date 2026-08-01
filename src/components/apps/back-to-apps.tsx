import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

/**
 * Volta para a grade de apps.
 *
 * As páginas de produto são folhas: chega-se nelas pelo card em /apps e não há
 * saída visível de volta, porque elas não estão no menu. Sem isto, o único
 * caminho é o botão do navegador. Abrir o card em nova aba resolveria o mesmo
 * problema, mas quebra o "voltar" e é convenção de link externo, não interno.
 *
 * O rótulo é o mesmo do menu (`Nav.apps`) de propósito: o destino é aquela
 * página, e dar dois nomes ao mesmo lugar confunde.
 */
export async function BackToApps() {
  const t = await getTranslations('Nav');

  return (
    <Link
      href="/apps"
      data-cta="back-to-apps"
      className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-text-secondary hover:text-primary transition-colors duration-200"
    >
      <ArrowLeft
        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
        strokeWidth={2}
      />
      {t('apps')}
    </Link>
  );
}
