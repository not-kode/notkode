'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/components/analytics';

/**
 * Marca uma vez que o formulário APARECEU na tela da pessoa (form_view).
 *
 * O funil só começava a contar na primeira interação real, o que responde "quem
 * começou a preencher e parou onde". Faltava a pergunta anterior: chegou alguém
 * até aqui? Sem isso, um período inteiro sem lead lia igual nos dois casos —
 * ninguém rolou até o formulário, ou rolou e não digitou uma letra.
 *
 * Meia área visível é o critério: contar o formulário que só passou de raspão no
 * fim da rolagem infla o topo do funil com quem nem leu a primeira pergunta.
 */
export function useFormView(serviceTag: string, form: string) {
  const ref = useRef<HTMLDivElement>(null);
  const marcado = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || marcado.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || marcado.current) return;
        marcado.current = true;
        track({ type: 'form_view', service_tag: serviceTag, label: form });
        obs.disconnect();
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [serviceTag, form]);

  return ref;
}
