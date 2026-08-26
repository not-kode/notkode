'use client';

import { useState, useTransition } from 'react';
import type { AdminUsuario } from '@/lib/admin-usuario';
import { SENHA_MINIMA } from './regras';
import {
  alternarAtivo, atualizarUsuario, criarUsuario, definirSenha, excluirUsuario,
} from './actions';

const input = 'w-full rounded-md border border-black/[0.1] bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-primary';
const rotulo = 'font-label text-[10px] uppercase tracking-wider text-text-muted';
const acaoLink = 'font-label text-[10px] font-medium text-primary hover:underline';

function quando(iso: string | null): string {
  if (!iso) return 'nunca entrou';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Quem entra no /admin. Cada pessoa tem e-mail e senha próprios; a senha nasce
 * aqui e vai para a pessoa por fora (não existe convite por e-mail).
 */
export function UsuariosView({ usuarios, euId }: { usuarios: AdminUsuario[]; euId: string | null }) {
  const [criando, setCriando] = useState(usuarios.length === 0);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [senhaDeId, setSenhaDeId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function rodar(fn: (fd: FormData) => Promise<{ ok: boolean; erro?: string }>, fd: FormData, aoDarCerto?: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await fn(fd);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para concluir.');
      aoDarCerto?.();
    });
  }

  function comId(fn: (fd: FormData) => Promise<{ ok: boolean; erro?: string }>, id: string, extra?: Record<string, string>) {
    const fd = new FormData();
    fd.set('id', id);
    for (const [k, v] of Object.entries(extra ?? {})) fd.set(k, v);
    rodar(fn, fd);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">Acessos</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Quem entra no CRM. A senha você define aqui e passa para a pessoa; ela pode trocar depois no próprio acesso.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCriando((v) => !v); setErro(null); }}
          className={acaoLink}
        >
          {criando ? 'cancelar' : '+ novo acesso'}
        </button>
      </div>

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {criando && (
        <form
          action={(fd) => rodar(criarUsuario, fd, () => setCriando(false))}
          className="flex flex-col gap-2 rounded-md border border-black/[0.06] bg-[#F4F5F7] p-3"
        >
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className={rotulo}>Nome</label>
              <input name="nome" required className={input} placeholder="Como a pessoa é chamada" />
            </div>
            <div>
              <label className={rotulo}>E-mail</label>
              <input name="email" type="email" required className={input} placeholder="nome@notkode.com.br" />
            </div>
            <div>
              <label className={rotulo}>Senha</label>
              <input
                name="senha"
                type="text"
                required
                minLength={SENHA_MINIMA}
                className={input}
                placeholder={`pelo menos ${SENHA_MINIMA} caracteres`}
              />
            </div>
            <div>
              <label className={rotulo}>Papel</label>
              <select name="papel" defaultValue="equipe" className={input}>
                <option value="equipe">Equipe</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-text-muted">
            O papel fica registrado, mas hoje não muda o que a pessoa enxerga: todo mundo vê o CRM inteiro.
          </p>
          <button
            type="submit"
            disabled={pendente}
            className="self-start rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            {pendente ? 'Criando…' : 'Criar acesso'}
          </button>
        </form>
      )}

      <ul className="flex flex-col divide-y divide-black/[0.06] rounded-md border border-black/[0.06]">
        {usuarios.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-text-muted">
            Nenhum acesso cadastrado ainda. Enquanto isso, o login segue pela senha geral.
          </li>
        )}

        {usuarios.map((u) => (
          <li key={u.id} className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {u.nome}
                  {u.id === euId && <span className="ml-1.5 text-[10px] text-text-muted">(você)</span>}
                  {!u.ativo && <span className="ml-1.5 text-[10px] text-danger">desativado</span>}
                </p>
                <p className="truncate font-mono text-[11px] text-text-muted">
                  {u.email} · {u.papel} · {quando(u.ultimoAcesso)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button type="button" className={acaoLink} onClick={() => { setEditandoId(editandoId === u.id ? null : u.id); setSenhaDeId(null); setErro(null); }}>
                  editar
                </button>
                <button type="button" className={acaoLink} onClick={() => { setSenhaDeId(senhaDeId === u.id ? null : u.id); setEditandoId(null); setErro(null); }}>
                  trocar senha
                </button>
                {u.id !== euId && (
                  <>
                    <button
                      type="button"
                      className={acaoLink}
                      onClick={() => comId(alternarAtivo, u.id, { ativo: u.ativo ? '0' : '1' })}
                    >
                      {u.ativo ? 'desativar' : 'reativar'}
                    </button>
                    <button
                      type="button"
                      className="font-label text-[10px] font-medium text-text-muted hover:text-danger hover:underline"
                      onClick={() => {
                        if (confirm(`Excluir o acesso de ${u.nome}? Ela perde o login na hora.`)) comId(excluirUsuario, u.id);
                      }}
                    >
                      excluir
                    </button>
                  </>
                )}
              </div>
            </div>

            {editandoId === u.id && (
              <form
                action={(fd) => rodar(atualizarUsuario, fd, () => setEditandoId(null))}
                className="grid gap-2 rounded-md bg-[#F4F5F7] p-2.5 md:grid-cols-[1fr_1fr_auto_auto]"
              >
                <input type="hidden" name="id" value={u.id} />
                <input name="nome" defaultValue={u.nome} required className={input} />
                <input name="email" type="email" defaultValue={u.email} required className={input} />
                <select name="papel" defaultValue={u.papel} className={input}>
                  <option value="equipe">Equipe</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={pendente} className={acaoLink}>
                  salvar
                </button>
              </form>
            )}

            {senhaDeId === u.id && (
              <form
                action={(fd) => rodar(definirSenha, fd, () => setSenhaDeId(null))}
                className="flex flex-wrap items-center gap-2 rounded-md bg-[#F4F5F7] p-2.5"
              >
                <input type="hidden" name="id" value={u.id} />
                <input
                  name="senha"
                  type="text"
                  required
                  minLength={SENHA_MINIMA}
                  className={`${input} max-w-xs`}
                  placeholder={`nova senha, pelo menos ${SENHA_MINIMA} caracteres`}
                />
                <button type="submit" disabled={pendente} className={acaoLink}>
                  salvar senha
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <p className="text-[11px] text-text-muted">
        A senha geral do time (ADMIN_PASSWORD) continua entrando sem e-mail. É a porta dos fundos para ninguém ficar
        trancado do lado de fora; quem entra por ela aparece sem nome nas tarefas.
      </p>
    </div>
  );
}
