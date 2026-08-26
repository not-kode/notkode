'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';

const CAMPO =
  'rounded-md border border-border-subtle/30 bg-surface-base px-4 py-2.5 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoFocus
          autoComplete="username"
          className={CAMPO}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-text-muted">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={CAMPO}
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
