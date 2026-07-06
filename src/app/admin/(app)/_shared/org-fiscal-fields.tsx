'use client';

// Campos cadastrais/fiscais da empresa CONTRATANTE (razão social, CNPJ, endereço,
// representante legal). Fonte ÚNICA usada em dois lugares que antes duplicavam o
// mesmo formulário: o drawer do cliente (aba Cadastro) e o drawer do negócio (Pipeline).
// Renderiza só os inputs — o <form>, o id oculto e o botão de salvar ficam com quem usa.

export type OrgFiscal = {
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

/** Dados para o contrato + endereço da empresa. `includeRepCpf` mostra o CPF do signatário. */
export function OrgFiscalFields({ org, includeRepCpf = true }: { org: Partial<OrgFiscal> | null | undefined; includeRepCpf?: boolean }) {
  return (
    <>
      <div>
        <p className="mb-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-secondary">Dados para o contrato</p>
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
