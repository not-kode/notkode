export function SectionMarker({ label }: { number?: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        {label}
      </span>
    </div>
  );
}
