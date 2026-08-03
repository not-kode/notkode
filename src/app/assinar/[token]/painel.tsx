'use client';

import { useRef, useState, useTransition } from 'react';
import { assinarDocumento, pedirCodigo, recusarDocumento } from './actions';
import { QuadroDeAssinatura, type QuadroHandle } from './quadro';

const PAPEL_LABEL: Record<string, string> = {
  contratante: 'Contratante',
  contratada: 'Contratada',
  testemunha: 'Testemunha',
};

const campo = 'w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary';
const rotulo = 'font-label text-[10px] uppercase tracking-wider text-neutral-500';

export function PainelDeAssinatura(props: {
  token: string;
  titulo: string;
  nome: string;
  email: string;
  papel: string;
  documentoUrl: string;
  jaAssinou: boolean;
  encerrado: boolean;
  statusDoPedido: string;
  linkVerificacao: string;
}) {
  const [etapa, setEtapa] = useState<'ler' | 'assinar' | 'pronto'>(props.jaAssinou ? 'pronto' : 'ler');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState(props.nome);
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [pendente, iniciar] = useTransition();
  const quadro = useRef<QuadroHandle>(null);

  const encerradoSemAssinar = props.encerrado && !props.jaAssinou;

  function solicitarCodigo() {
    setErro(null);
    iniciar(async () => {
      const r = await pedirCodigo(props.token);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para enviar o código.');
      setEtapa('assinar');
      setAviso(`Enviamos um código de 6 dígitos para ${props.email}.`);
    });
  }

  function confirmar() {
    setErro(null);
    if (codigo.trim().length !== 6) return setErro('Digite os 6 dígitos do código que enviamos por e-mail.');
    if (!nome.trim()) return setErro('Escreva seu nome completo.');
    if (!aceite) return setErro('Marque a confirmação de que você leu e concorda com o documento.');

    iniciar(async () => {
      const r = await assinarDocumento({
        token: props.token,
        codigo: codigo.trim(),
        nome: nome.trim(),
        traco: quadro.current?.temTraco() ? quadro.current.paraPng() : null,
      });
      if (!r.ok) return setErro(r.erro ?? 'Não deu para assinar.');
      setEtapa('pronto');
      setAviso(null);
    });
  }

  function confirmarRecusa() {
    setErro(null);
    iniciar(async () => {
      const r = await recusarDocumento(props.token, motivo);
      if (!r.ok) return setErro(r.erro ?? 'Não deu para registrar a recusa.');
      setRecusando(false);
      setAviso('Recusa registrada. A Notkode foi avisada.');
      setEtapa('pronto');
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-8 md:px-6">
      <header>
        <p className="font-label text-[10px] uppercase tracking-wider text-primary">Assinatura eletrônica</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{props.titulo}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {props.nome} · {PAPEL_LABEL[props.papel] ?? props.papel} · {props.email}
        </p>
      </header>

      <iframe
        src={props.documentoUrl}
        title="Documento"
        className="h-[65vh] w-full rounded-xl border border-black/10 bg-white"
      />

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={props.documentoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[10px] uppercase tracking-wider text-neutral-500 underline decoration-dotted hover:text-primary"
        >
          Abrir em outra aba
        </a>
      </div>

      {etapa === 'pronto' ? (
        <section className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-base font-bold text-neutral-900">
            {props.jaAssinou || props.statusDoPedido === 'assinado' ? 'Documento assinado' : 'Tudo certo'}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {aviso ?? 'Sua assinatura foi registrada. Quando todas as partes assinarem, você recebe a cópia final por e-mail.'}
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            Verificação: <a className="text-primary underline" href={props.linkVerificacao}>{props.linkVerificacao}</a>
          </p>
        </section>
      ) : encerradoSemAssinar ? (
        <section className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-base font-bold text-neutral-900">Este documento não está mais aberto para assinatura</h2>
          <p className="mt-1 text-sm text-neutral-600">Se você acha que isso é um engano, fale com a Notkode.</p>
        </section>
      ) : recusando ? (
        <section className="rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-base font-bold text-neutral-900">Recusar a assinatura</h2>
          <p className="mt-1 text-sm text-neutral-600">Conte o motivo, para a gente ajustar o que for preciso.</p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className={`${campo} mt-3`}
            placeholder="Motivo (opcional)"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmarRecusa}
              disabled={pendente}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              Confirmar recusa
            </button>
            <button
              onClick={() => setRecusando(false)}
              className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-black/20"
            >
              Voltar
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-black/10 bg-white p-5">
          {etapa === 'ler' ? (
            <>
              <h2 className="text-base font-bold text-neutral-900">Pronto para assinar?</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Leia o documento acima. Para confirmar que é você, enviamos um código de 6 dígitos para {props.email}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={solicitarCodigo}
                  disabled={pendente}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
                >
                  {pendente ? 'Enviando…' : 'Enviar código e assinar'}
                </button>
                <button
                  onClick={() => setRecusando(true)}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-black/20"
                >
                  Recusar
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-neutral-900">Confirme e assine</h2>
              {aviso && <p className="mt-1 text-sm text-neutral-600">{aviso}</p>}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={rotulo} htmlFor="codigo">Código do e-mail</label>
                  <input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className={`${campo} mt-1 font-mono tracking-[0.3em]`}
                  />
                  <button
                    onClick={solicitarCodigo}
                    disabled={pendente}
                    className="mt-2 font-label text-[10px] uppercase tracking-wider text-neutral-500 underline decoration-dotted hover:text-primary disabled:opacity-60"
                  >
                    Reenviar código
                  </button>
                </div>

                <div>
                  <label className={rotulo} htmlFor="nome">Nome completo</label>
                  <input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={`${campo} mt-1`}
                  />
                </div>
              </div>

              <div className="mt-4">
                <span className={rotulo}>Assine com o dedo ou o mouse (opcional)</span>
                <QuadroDeAssinatura ref={quadro} />
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#3B82F6]"
                />
                <span>
                  Li o documento acima, concordo com o seu conteúdo e aceito assiná-lo eletronicamente, nos termos da
                  MP nº 2.200-2/2001 e da Lei nº 14.063/2020.
                </span>
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={confirmar}
                  disabled={pendente}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
                >
                  {pendente ? 'Assinando…' : 'Assinar documento'}
                </button>
                <button
                  onClick={() => setRecusando(true)}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-black/20"
                >
                  Recusar
                </button>
              </div>
            </>
          )}

          {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

          <p className="mt-4 text-xs text-neutral-500">
            Ao assinar, ficam registrados a data, a hora, o seu endereço IP e o dispositivo usado, junto do resumo
            criptográfico do documento. É isso que comprova a assinatura.
          </p>
        </section>
      )}
    </div>
  );
}
