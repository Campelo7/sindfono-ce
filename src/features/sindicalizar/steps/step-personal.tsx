"use client";

import type { StepData } from "../sindicalizar-stepper";

const inputCls = "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const selectCls = `${inputCls} cursor-pointer`;

const Field = ({ label, required = true, error, children, className }: {
  label: string; required?: boolean; error?: string;
  children: React.ReactNode; className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-orange-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="col-span-full text-base font-bold text-[#0f1f5c] pb-1 border-b border-gray-100">{children}</h3>
);

interface Props { data: StepData; onChange: (patch: Partial<StepData>) => void; }

export const StepPersonal = ({ data, onChange }: Props) => {
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ [k]: e.target.value });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SectionTitle>Dados Pessoais</SectionTitle>

      <Field label="Nome completo" className="sm:col-span-2">
        <input className={inputCls} value={data.fullName ?? ""} onChange={s("fullName")} placeholder="Seu nome completo" />
      </Field>
      <Field label="CPF">
        <input className={inputCls} value={data.cpf ?? ""} onChange={s("cpf")} placeholder="000.000.000-00" maxLength={14} />
      </Field>
      <Field label="Inscrição no CREFONO 8 / Matrícula" className="sm:col-span-2">
        <input className={inputCls} value={data.crfaOrStudentInfo ?? ""} onChange={s("crfaOrStudentInfo")} placeholder="CREFONO 8 - xxxxx (estudantes: instituição e matrícula)" />
      </Field>
      <Field label="Data de nascimento">
        <input className={inputCls} type="date" value={data.birthDate ?? ""} onChange={s("birthDate")} />
      </Field>
      <Field label="E-mail">
        <input
          className={`${inputCls} bg-gray-50 text-gray-600`}
          type="email"
          value={data.email ?? ""}
          readOnly
          title="Use o e-mail da sua conta"
        />
      </Field>
      <Field label="Telefone (DDD + número)">
        <input className={inputCls} value={data.phone ?? ""} onChange={s("phone")} placeholder="85 91234-5678" />
      </Field>
      <Field label="RG">
        <input className={inputCls} value={data.rg ?? ""} onChange={s("rg")} />
      </Field>
      <Field label="Órgão expedidor e data">
        <input className={inputCls} value={data.issuingAgency ?? ""} onChange={s("issuingAgency")} placeholder="SSPDS - CE - 01/01/2001" />
      </Field>
      <Field label="Filiação (pai e mãe)" className="sm:col-span-2">
        <input className={inputCls} value={data.filiacao ?? ""} onChange={s("filiacao")} placeholder="Nome do pai / Nome da mãe" />
      </Field>
      <Field label="Estado civil">
        <select className={selectCls} value={data.maritalStatus ?? ""} onChange={s("maritalStatus")}>
          <option value="">Selecione…</option>
          {[["SOLTEIRO","Solteiro(a)"],["CASADO","Casado(a)"],["SEPARADO","Separado(a)"],["DIVORCIADO","Divorciado(a)"],["VIUVO","Viúvo(a)"],["UNIAO_ESTAVEL","União Estável"],["OUTRO","Outro"]].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Nacionalidade">
        <input className={inputCls} value={data.nationality ?? ""} onChange={s("nationality")} placeholder="Brasileiro(a)" />
      </Field>
      <Field label="Naturalidade" className="sm:col-span-2">
        <input className={inputCls} value={data.birthplace ?? ""} onChange={s("birthplace")} placeholder="Cidade e estado onde nasceu" />
      </Field>

      <SectionTitle>Endereço Residencial</SectionTitle>
      <Field label="CEP">
        <input className={inputCls} value={data.residentialCep ?? ""} onChange={s("residentialCep")} placeholder="00000-000" maxLength={9} />
      </Field>
      <Field label="Cidade">
        <input className={inputCls} value={data.residentialCity ?? ""} onChange={s("residentialCity")} placeholder="Fortaleza" />
      </Field>
      <Field label="Logradouro" className="sm:col-span-2">
        <input className={inputCls} value={data.residentialStreet ?? ""} onChange={s("residentialStreet")} placeholder="Ex: Av. Ceará" />
      </Field>
      <Field label="Número">
        <input className={inputCls} value={data.residentialNumber ?? ""} onChange={s("residentialNumber")} />
      </Field>
      <Field label="Complemento" required={false}>
        <input className={inputCls} value={data.residentialComplement ?? ""} onChange={s("residentialComplement")} placeholder="Apt, bloco, casa…" />
      </Field>
      <Field label="Bairro">
        <input className={inputCls} value={data.residentialNeighborhood ?? ""} onChange={s("residentialNeighborhood")} />
      </Field>

      <SectionTitle>Dados Profissionais</SectionTitle>
      <Field label="Relação trabalhista">
        <select className={selectCls} value={data.workRelation ?? ""} onChange={s("workRelation")}>
          <option value="">Selecione…</option>
          {[["CLT","Carteira assinada (CLT)"],["PJ","Pessoa Jurídica (PJ)"],["LIBERAL","Profissional Liberal"],["CONCURSADO","Concursado(a)"],["OUTRO","Outro"]].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Área(s) de atuação">
        <input className={inputCls} value={data.practiceAreas ?? ""} onChange={s("practiceAreas")} placeholder="Ex: Audiologia, Linguagem" />
      </Field>
      <Field label="Detalhes do trabalho" className="sm:col-span-2">
        <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm min-h-[80px] resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={data.workDetails ?? ""} onChange={s("workDetails")} placeholder="Nome da empresa e período, ou NÃO" />
      </Field>
      <Field label="Endereço comercial" className="sm:col-span-2">
        <textarea className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm min-h-[72px] resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={data.commercialAddress ?? ""} onChange={s("commercialAddress")} placeholder="Rua, nº, bairro, cidade - UF, CEP" />
      </Field>
      <Field label="Instituição de formação">
        <input className={inputCls} value={data.graduationInstitution ?? ""} onChange={s("graduationInstitution")} />
      </Field>
      <Field label="Ano de formação">
        <input className={inputCls} type="number" value={data.graduationYear ?? ""} onChange={s("graduationYear")} placeholder="2018" min={1970} max={2030} />
      </Field>
    </div>
  );
};
