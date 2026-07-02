import { AdminShell } from './admin-shell';

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
