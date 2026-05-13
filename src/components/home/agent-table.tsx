// UI overlay table — sits on top of photographic background (relace.ai style)
const ROWS = [
  { agent: 'atendimento.agent', task: 'Lead #482 qualificado',    duration: '248ms', status: 'done'    },
  { agent: 'reports.agent',     task: 'Relatório semanal gerado', duration: '891ms', status: 'done'    },
  { agent: 'crm.sync',          task: '47 registros atualizados', duration: '1.2s',  status: 'done'    },
  { agent: 'finance.agent',     task: 'Análise de desempenho',    duration: '—',     status: 'running' },
  { agent: 'email.agent',       task: 'Campanha nurturing',       duration: '—',     status: 'queued'  },
];

const STATUS_STYLES: Record<string, string> = {
  done:    'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25',
  running: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25',
  queued:  'bg-white/10 text-white/40 border border-white/15',
};

const STATUS_LABELS: Record<string, string> = {
  done:    'Concluído',
  running: 'Executando',
  queued:  'Na fila',
};

export function AgentTable() {
  return (
    <div
      className="w-full max-w-2xl rounded-xl overflow-hidden"
      style={{
        background: 'rgba(10, 10, 14, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Table header */}
      <div className="grid grid-cols-[1.6fr_2fr_0.8fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.07]">
        {['Agente', 'Tarefa', 'Duração', 'Status'].map((h) => (
          <span key={h} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30 select-none">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.6fr_2fr_0.8fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.05] last:border-none"
        >
          <span className="font-mono text-[11px] text-white/50 truncate">{row.agent}</span>
          <span className="font-mono text-[11px] text-white/65 truncate">{row.task}</span>
          <span className="font-mono text-[11px] text-white/40">{row.duration}</span>
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-mono text-[10px] w-fit ${STATUS_STYLES[row.status]}`}
          >
            {STATUS_LABELS[row.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
