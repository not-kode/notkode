import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { EntregasView } from './entregas-view';
import type { ProjectView } from './types';
import type { PhaseStatus, Priority, TaskStatus } from './status';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

type EngRow = {
  id: string;
  title: string | null;
  lifecycle: string;
  start_date: string | null;
  end_date: string | null;
  client_token: string | null;
  organization_id: string | null;
  is_internal: boolean | null;
  organizations: { id: string; name: string | null } | null;
};
type PhaseRow = {
  id: string; engagement_id: string; name: string; description: string | null;
  status: PhaseStatus; start_date: string | null; end_date: string | null;
  sort: number; client_visible: boolean;
};
type TaskRow = {
  id: string; engagement_id: string; phase_id: string | null; title: string;
  notes: string | null; status: TaskStatus; priority: Priority | null;
  start_date: string | null; due_date: string | null;
  assignee: string | null; client_visible: boolean; sort: number | null;
};

export default async function EntregasPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: engData }, { data: phaseData }, { data: taskData }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, title, lifecycle, start_date, end_date, client_token, organization_id, is_internal, organizations(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('project_phases').select('*').order('sort'),
    supabase.from('project_tasks').select('*').order('sort'),
  ]);

  const engs = (engData ?? []) as unknown as EngRow[];
  const phases = (phaseData ?? []) as PhaseRow[];
  const tasks = (taskData ?? []) as TaskRow[];

  const projects: ProjectView[] = engs.map((e) => ({
    id: e.id,
    title: e.title,
    orgName: e.organizations?.name ?? null,
    lifecycle: e.lifecycle,
    startDate: e.start_date,
    endDate: e.end_date,
    clientUrl: e.client_token ? `${SITE_URL}/acompanhamento/${e.client_token}` : null,
    isInternal: e.is_internal ?? false,
    phases: phases
      .filter((p) => p.engagement_id === e.id)
      .map((p) => ({
        id: p.id, name: p.name, description: p.description, status: p.status,
        startDate: p.start_date, endDate: p.end_date, clientVisible: p.client_visible,
      })),
    tasks: tasks
      .filter((t) => t.engagement_id === e.id)
      .map((t) => ({
        id: t.id, phaseId: t.phase_id, title: t.title, notes: t.notes, status: t.status,
        priority: t.priority ?? 'media', startDate: t.start_date, dueDate: t.due_date,
        assignee: t.assignee, clientVisible: t.client_visible, sort: t.sort ?? 0,
      })),
  }));

  // Contrato encerrado sem nenhuma tarefa/etapa é ruído: não tem entrega para
  // acompanhar. Some da lista, mas volta assim que ganhar um cronograma.
  const visiveis = projects.filter(
    (p) => p.lifecycle !== 'encerrado' || p.phases.length > 0 || p.tasks.length > 0,
  );

  return <EntregasView projects={visiveis} />;
}
