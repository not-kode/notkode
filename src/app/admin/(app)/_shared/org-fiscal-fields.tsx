'use client';

// Campos cadastrais/fiscais da empresa CONTRATANTE (razão social, CNPJ, endereço,
// representante legal). Fonte ÚNICA usada em dois lugares que antes duplicavam o
// mesmo formulário: o drawer do cliente (aba Cadastro) e o drawer do negócio (Pipeline).
// Renderiza só os inputs — o <form>, o id oculto e o botão de salvar ficam com quem usa.

import { useRef, useState } from 'react';
import { lerDadosCadastrais, ROTULO_CADASTRAL, type DadosCadastrais } from '@/lib/dados-cadastrais';

export type OrgFiscal = {
  site?: string | null;
  instagram?: string | null;
  legal_name: string | null;
  tax_id: string | null;
  state_registration: string | null;
  legal_rep: string | null;
  legal_rep_cpf?: string | null;
  address_street: string | null;
  address_number: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
};

const inputCls =
  'w-full rounded-md border border-black/[0.08] bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';
const labelCls = 'mb-1 block font-label text-[10px] uppercase tracking-[0.12em] text-text-muted';

function Field({ label, name, defaultValue, placeholder, className = '' }: { label: string; name: string; defaultValue?: string | null; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <input name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

/**
 * Cola o texto do CNPJ (o do Google, o do cartão da Receita) e cada pedaço vai
 * para o seu campo. Preenche o formulário de verdade, disparando os eventos que
 * o salvamento automático escuta — o mesmo que aconteceria digitando.
 */
function ColarDados() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [preenchidos, setPreenchidos] = useState<string[] | null>(null);
  const caixaRef = useRef<HTMLTextAreaElement>(null);

  const preencher = () => {
    const form = caixaRef.current?.closest('form');
    if (!form) return;

    const achados = lerDadosCadastrais(texto);
    const nomes: string[] = [];

    for (const [campo, valor] of Object.entries(achados) as [keyof DadosCadastrais, string][]) {
      const el = form.elements.namedItem(campo);
      if (!(el instanceof HTMLInputElement) || !valor) continue;
      // React ignora `el.value = x`: o setter nativo é quem faz o evento sair
      // com o valor novo, e sem ele o autosave gravaria o campo em branco.
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, valor);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      nomes.push(ROTULO_CADASTRAL[campo]);
    }

    setPreenchidos(nomes);
    if (nomes.length > 0) setTexto('');
  };

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="self-start rounded-md border border-black/[0.1] px-2.5 py-1.5 font-label text-[10px] uppercase tracking-wider text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
      >
        ⧉ colar dados do CNPJ
      </button>
    );
  }

  return (
    <div className="rounded-md border border-primary/25 bg-primary/[0.03] p-3">
      <p className="font-label text-[10px] uppercase tracking-[0.14em] text-primary">Colar dados do CNPJ</p>
      <p className="mt-0.5 text-[11px] text-text-muted">
        Cole o texto da consulta (Google, cartão da Receita) e os campos abaixo se preenchem sozinhos.
      </p>
      <textarea
        ref={caixaRef}
        value={texto}
        onChange={(e) => { setTexto(e.target.value); setPreenchidos(null); }}
        rows={4}
        placeholder="O CNPJ da empresa FULANO LTDA - ME é 00.000.000/0001-00. Com sede em BRASILIA, DF..."
        className="mt-2 w-full rounded-md border border-black/[0.08] bg-white px-3 py-2 text-xs text-text-primary outline-none transition-colors focus:border-primary/50"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={preencher}
          disabled={!texto.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          Preencher campos
        </button>
        <button
          type="button"
          onClick={() => { setAberto(false); setTexto(''); setPreenchidos(null); }}
          className="rounded-md px-2 py-1.5 text-xs text-text-muted transition hover:text-text-primary"
        >
          fechar
        </button>
        {preenchidos && (
          <span className={`text-[11px] ${preenchidos.length ? 'text-success' : 'text-warning'}`}>
            {preenchidos.length
              ? `preenchido: ${preenchidos.join(', ')}`
              : 'não reconheci nenhum dado nesse texto'}
          </span>
        )}
      </div>
    </div>
  );
}

/** Dados para o contrato + endereço da empresa. `includeRepCpf` mostra o CPF do signatário. */
export function OrgFiscalFields({ org, includeRepCpf = true }: { org: Partial<OrgFiscal> | null | undefined; includeRepCpf?: boolean }) {
  return (
    <>
      {/* Onde o cliente está na internet. Fica com o telefone e o e-mail dele,
          porque é isso que se procura junto na hora de falar com ele. */}
      <div>
        <p className="mb-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Presença do cliente</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Site" name="site" defaultValue={org?.site} placeholder="cliente.com.br" />
          <Field label="Instagram" name="instagram" defaultValue={org?.instagram} placeholder="@cliente" />
        </div>
      </div>
      <div className="border-t border-black/[0.06] pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Dados para o contrato</p>
        </div>
        <div className="mb-3 flex flex-col"><ColarDados /></div>
        <div className="flex flex-col gap-3">
          <Field label="Razão social" name="legal_name" defaultValue={org?.legal_name} placeholder="Empresa LTDA" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CNPJ / CPF" name="tax_id" defaultValue={org?.tax_id} placeholder="00.000.000/0001-00" />
            <Field label="Inscr. estadual" name="state_registration" defaultValue={org?.state_registration} placeholder="Isento" />
          </div>
          <div className={includeRepCpf ? 'grid grid-cols-2 gap-3' : ''}>
            <Field label="Representante legal" name="legal_rep" defaultValue={org?.legal_rep} placeholder="Quem assina" />
            {includeRepCpf && <Field label="CPF do signatário" name="legal_rep_cpf" defaultValue={org?.legal_rep_cpf} placeholder="000.000.000-00" />}
          </div>
        </div>
      </div>
      <div className="border-t border-black/[0.06] pt-4">
        <p className="mb-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Endereço</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <Field label="Logradouro" name="address_street" defaultValue={org?.address_street} placeholder="Rua / Av." />
            <Field label="Número" name="address_number" defaultValue={org?.address_number} placeholder="123" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bairro" name="address_district" defaultValue={org?.address_district} />
            <Field label="CEP" name="address_zip" defaultValue={org?.address_zip} placeholder="00000-000" />
          </div>
          <div className="grid grid-cols-[1fr_4rem] gap-3">
            <Field label="Cidade" name="address_city" defaultValue={org?.address_city} />
            <Field label="UF" name="address_state" defaultValue={org?.address_state} placeholder="SP" />
          </div>
        </div>
      </div>
    </>
  );
}
