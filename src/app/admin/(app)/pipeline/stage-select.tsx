'use client';

import { useRef } from 'react';
import { moveDealStage } from './actions';
import { DEAL_STAGES, STAGE_LABELS } from './stages';

export function StageSelect({ id, stage }: { id: string; stage: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={moveDealStage} ref={formRef}>
      <input type="hidden" name="id" value={id} />
      <select
        name="stage"
        defaultValue={stage}
        onChange={() => formRef.current?.requestSubmit()}
        className="w-full cursor-pointer rounded border border-border-subtle/20 bg-surface-base px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-text-muted outline-none transition hover:border-primary focus:border-primary"
        aria-label="Mover de estágio"
      >
        {DEAL_STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
