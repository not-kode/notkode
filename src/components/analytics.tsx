'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Tracking próprio, first-party e sem cookies. Usa sessionStorage para um id
// efêmero de sessão (não-PII) e captura UTM da URL na chegada. Envia eventos
// para /api/track via sendBeacon (com fallback fetch keepalive). À prova de
// falhas: qualquer erro é engolido e nunca afeta a navegação.

const SID_KEY = 'nk_sid';
const UTM_KEY = 'nk_utm';
const REF_KEY = 'nk_ref';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${String(Math.random()).slice(2, 10)}`;
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function capturedUtm(): Record<string, string> {
  try {
    const fromUrl: Record<string, string> = {};
    const q = new URLSearchParams(window.location.search);
    for (const f of UTM_FIELDS) {
      const v = q.get(f);
      if (v) fromUrl[f] = v;
    }
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = sessionStorage.getItem(UTM_KEY);
    return stored ? (JSON.parse(stored) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** UTM capturado nesta sessão (da URL de chegada). Para os formulários anexarem ao lead. */
export function getUtm(): Record<string, string> {
  return capturedUtm();
}

/** Id efêmero da sessão (não-PII). Para casar rascunho ↔ envio do formulário. */
export function getSessionId(): string {
  return sessionId();
}

/**
 * Salva/atualiza o RASCUNHO do formulário (captura progressiva): quem começou a
 * preencher mas ainda não enviou. First-party, via sendBeacon. À prova de falhas.
 * `submitted: true` marca que o envio de verdade aconteceu (sai da lista de abandonados).
 */
export function saveLeadDraft(payload: {
  service_tag?: string | null;
  kind?: string | null;
  name?: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  needs?: string[];
  timing?: string;
  description?: string;
  last_step?: string | null;
  submitted?: boolean;
}) {
  try {
    const body = JSON.stringify({ ...payload, session_id: sessionId(), ...capturedUtm() });
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/lead/draft', blob)) return;
    void fetch('/api/lead/draft', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  } catch {
    /* noop */
  }
}

// Referrer de ENTRADA da sessão: captura uma única vez o document.referrer da
// chegada, ignorando navegação interna (mesmo host). Persistido em sessionStorage
// para que os page_views seguintes mantenham a origem externa real (Google, Instagram, …)
// em vez do header Referer do beacon, que aponta sempre para a página atual do site.
function entryReferrer(): string {
  try {
    const stored = sessionStorage.getItem(REF_KEY);
    if (stored !== null) return stored;
    let entry = '';
    const ref = document.referrer || '';
    if (ref) {
      try {
        if (new URL(ref).host !== window.location.host) entry = ref;
      } catch {
        /* referrer malformado → trata como direto */
      }
    }
    sessionStorage.setItem(REF_KEY, entry);
    return entry;
  } catch {
    return '';
  }
}

/** Dispara um evento de tracking. Exportado para os formulários marcarem form_submit. */
export function track(payload: { type: 'page_view' | 'cta_click' | 'form_start' | 'form_step' | 'form_submit'; page?: string; label?: string | null; service_tag?: string | null; locale?: string | null }) {
  try {
    // Browser automatizado (crawler executando JS) não vira métrica.
    if (navigator.webdriver) return;
    const body = JSON.stringify({ ...payload, session_id: sessionId(), referrer: entryReferrer(), ...capturedUtm() });
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/track', blob)) return;
    void fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  } catch {
    /* noop */
  }
}

export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  // page_view a cada navegação (inclui a primeira carga).
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    track({ type: 'page_view', page: pathname, locale: pathname.split('/')[1] || null });
  }, [pathname]);

  // Clique em qualquer elemento com [data-cta] → cta_click (delegação global).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.('[data-cta]') as HTMLElement | null;
      if (!el) return;
      track({
        type: 'cta_click',
        page: window.location.pathname,
        label: el.getAttribute('data-cta'),
        service_tag: el.getAttribute('data-service'),
      });
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
