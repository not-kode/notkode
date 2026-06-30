'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-text-muted">
          Senha de acesso
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="rounded-md border border-border-subtle/30 bg-surface-base px-4 py-2.5 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-cyan-600 disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
