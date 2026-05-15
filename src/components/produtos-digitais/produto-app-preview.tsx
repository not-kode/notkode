import { LayoutDashboard, Package, Users, BarChart3, Settings, Search, Bell, ChevronUp, ChevronDown } from 'lucide-react';

// Illustrated SaaS app mockup — represents what we build
export function ProdutoAppPreview() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Soft glow behind the device — brand cyan */}
      <div
        className="absolute -inset-12 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(75,210,229,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Browser window frame */}
      <div
        className="relative rounded-2xl overflow-hidden border border-black/[0.10] shadow-2xl"
        style={{
          boxShadow: '0 30px 80px -30px rgba(75,210,229,0.22), 0 16px 40px -16px rgba(0,0,0,0.12)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-5 h-10 border-b border-black/[0.06]" style={{ background: 'rgba(25,25,24,0.04)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 max-w-md mx-auto h-6 rounded-md px-3 flex items-center gap-2" style={{ background: 'rgba(25,25,24,0.05)' }}>
            <span className="w-1 h-1 rounded-full bg-[#22C55E]" />
            <span className="font-mono text-[10px] text-text-dim">app.suaempresa.com.br/dashboard</span>
          </div>
          <span className="font-mono text-[10px] text-text-dim">notkode v2.1</span>
        </div>

        {/* App layout */}
        <div className="flex" style={{ background: 'hsl(55 100% 97%)' }}>
          {/* Sidebar */}
          <aside className="hidden sm:flex flex-col w-[200px] shrink-0 border-r border-black/[0.06] py-5 px-3" style={{ background: 'rgba(25,25,24,0.02)' }}>
            <div className="flex items-center gap-2 px-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">N</span>
              </div>
              <span className="font-semibold text-[13px] text-text-primary">Sua Empresa</span>
            </div>

            <nav className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
              <SidebarItem icon={Package}         label="Pedidos"   count="12" />
              <SidebarItem icon={Users}           label="Clientes" />
              <SidebarItem icon={BarChart3}       label="Relatórios" />
              <SidebarItem icon={Settings}        label="Configurações" />
            </nav>

            <div className="mt-auto pt-6">
              <div className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
                <p className="font-mono text-[9px] text-primary uppercase tracking-widest mb-1">IA Ativa</p>
                <p className="text-[11px] text-text-secondary leading-snug">3 ações automáticas hoje</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-5 lg:p-7">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-0.5">Visão geral</p>
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-text-primary leading-tight">Olá, Camila 👋</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex h-8 px-3 rounded-md items-center gap-2" style={{ background: 'rgba(25,25,24,0.04)' }}>
                  <Search className="w-3.5 h-3.5 text-text-dim" strokeWidth={1.8} />
                  <span className="font-mono text-[10px] text-text-dim">buscar…</span>
                </div>
                <button className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(25,25,24,0.04)' }}>
                  <Bell className="w-3.5 h-3.5 text-text-secondary" strokeWidth={1.8} />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">C</span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Vendas hoje" value="R$ 24.8k" delta="+12%" up />
              <StatCard label="Pedidos"     value="48"       delta="+8"   up />
              <StatCard label="Ticket médio" value="R$ 517"   delta="-3%"  up={false} />
            </div>

            {/* Chart placeholder */}
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(25,25,24,0.02)', border: '1px solid rgba(25,25,24,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-text-primary">Receita · últimos 7 dias</p>
                <span className="font-mono text-[9px] text-text-dim">R$ 142.3k</span>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-2 h-20">
                {[35, 50, 42, 65, 58, 80, 72].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 5 ? '#3B82F6' : 'rgba(59,130,246,0.25)' }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['S','T','Q','Q','S','S','D'].map((d, i) => (
                  <span key={i} className="flex-1 text-center font-mono text-[8px] text-text-dim">{d}</span>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-text-primary">Atividade recente</p>
                <span className="font-mono text-[9px] text-primary">automatizado por IA</span>
              </div>
              <div className="space-y-1.5">
                <ActivityRow color="#22C55E" text="Pedido #4521 confirmado" time="há 2min" />
                <ActivityRow color="#3B82F6" text="Cliente novo cadastrado" time="há 8min" />
                <ActivityRow color="#F59E0B" text="Estoque baixo: produto X" time="há 12min" />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating phone mockup — IA notifications view */}
      <div className="hidden md:block absolute -bottom-10 -right-4 lg:-right-8 w-[152px] lg:w-[176px] rotate-[7deg]">
        {/* Soft cyan glow behind phone */}
        <div
          className="absolute -inset-6 rounded-[40px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(75,210,229,0.20) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="relative rounded-[32px] overflow-hidden border-[8px]"
          style={{
            background: '#0a0a0f',
            borderColor: '#0a0a0f',
            boxShadow: '0 26px 70px -24px rgba(0,0,0,0.5), 0 8px 24px -8px rgba(75,210,229,0.18)',
          }}
        >
          {/* Phone screen */}
          <div className="aspect-[9/19.5] px-2.5 pt-7 pb-3" style={{ background: 'hsl(55 100% 97%)' }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="font-mono text-[7px] text-text-primary font-semibold">9:41</span>
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-text-primary" />
                <div className="w-1 h-1 rounded-full bg-text-primary" />
                <div className="w-1 h-1 rounded-full bg-text-primary" />
              </div>
            </div>

            {/* App header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">N</span>
              </div>
              <div className="flex-1">
                <p className="text-[8px] font-semibold text-text-primary leading-none">Notifs IA</p>
                <p className="text-[5px] text-text-dim leading-none mt-0.5">3 novas hoje</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Notification feed */}
            <div className="space-y-1.5">
              <div
                className="rounded-md px-2 py-1.5"
                style={{
                  background: 'rgba(75,210,229,0.10)',
                  border: '1px solid rgba(75,210,229,0.18)',
                }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[6px] font-mono text-primary font-bold tracking-wider">IA</span>
                  <span className="text-[5px] text-text-dim">há 2min</span>
                </div>
                <p className="text-[6.5px] text-text-primary leading-snug">
                  Lead João S. respondeu. Quente.
                </p>
              </div>

              <div className="rounded-md px-2 py-1.5" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[6px] font-mono text-text-secondary font-bold tracking-wider">IA</span>
                  <span className="text-[5px] text-text-dim">há 12min</span>
                </div>
                <p className="text-[6.5px] text-text-primary leading-snug">
                  E-mail enviado pra 8 clientes.
                </p>
              </div>

              <div className="rounded-md px-2 py-1.5" style={{ background: 'rgba(25,25,24,0.03)' }}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[6px] font-mono text-text-secondary font-bold tracking-wider">IA</span>
                  <span className="text-[5px] text-text-dim">há 1h</span>
                </div>
                <p className="text-[6.5px] text-text-primary leading-snug">
                  Estoque baixo: produto X.
                </p>
              </div>
            </div>
          </div>

          {/* Notch / Dynamic Island */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full" style={{ background: '#0a0a0f' }} />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false, count }: { icon: typeof LayoutDashboard; label: string; active?: boolean; count?: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md"
      style={{
        background: active ? 'rgba(59,130,246,0.10)' : 'transparent',
        color: active ? '#3B82F6' : 'rgba(25,25,24,0.65)',
      }}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
      <span className="text-[11px] font-medium flex-1">{label}</span>
      {count && (
        <span className="text-[9px] font-mono px-1.5 rounded-full" style={{ background: active ? 'rgba(59,130,246,0.18)' : 'rgba(25,25,24,0.06)' }}>
          {count}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(25,25,24,0.02)', border: '1px solid rgba(25,25,24,0.06)' }}>
      <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-1.5">{label}</p>
      <p className="font-bricolage text-[18px] lg:text-[20px] font-bold text-text-primary leading-none mb-1.5">{value}</p>
      <div className="flex items-center gap-1">
        {up ? <ChevronUp className="w-3 h-3 text-[#22C55E]" strokeWidth={2.5} /> : <ChevronDown className="w-3 h-3 text-[#EF4444]" strokeWidth={2.5} />}
        <span className="font-mono text-[10px] font-semibold" style={{ color: up ? '#22C55E' : '#EF4444' }}>{delta}</span>
      </div>
    </div>
  );
}

function ActivityRow({ color, text, time }: { color: string; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md" style={{ background: 'rgba(25,25,24,0.02)' }}>
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[11px] text-text-secondary flex-1">{text}</span>
      <span className="font-mono text-[9px] text-text-dim">{time}</span>
    </div>
  );
}
