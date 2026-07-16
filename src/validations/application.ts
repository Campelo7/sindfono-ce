import { z } from "zod";
import { isValidCpf } from "@/lib/branded-types";

export const step1Schema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  crfaOrStudentInfo: z.string().min(2, "Inscrição no CREFONO 8 ou dados da instituição são obrigatórios"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  cpf: z
    .string()
    .min(11, "CPF é obrigatório")
    .refine(isValidCpf, { message: "CPF inválido. Confira os números digitados." }),
  rg: z.string().min(3, "RG é obrigatório"),
  issuingAgency: z.string().min(3, "Órgão expedidor é obrigatório"),
  filiacao: z.string().min(3, "Filiação é obrigatória"),
  maritalStatus: z.enum(["SOLTEIRO","CASADO","SEPARADO","DIVORCIADO","VIUVO","UNIAO_ESTAVEL","OUTRO"], {
    errorMap: () => ({ message: "Selecione o estado civil" }),
  }),
  nationality: z.string().min(2, "Nacionalidade é obrigatória"),
  birthplace: z.string().min(2, "Naturalidade é obrigatória"),
});

export const step2Schema = z.object({
  residentialStreet: z.string().min(2, "Logradouro é obrigatório"),
  residentialNumber: z.string().min(1, "Número é obrigatório"),
  residentialComplement: z.string().min(1, "Complemento é obrigatório"),
  residentialNeighborhood: z.string().min(2, "Bairro é obrigatório"),
  residentialCity: z.string().min(2, "Cidade é obrigatória"),
  residentialCep: z.string().min(8, "CEP é obrigatório"),
});

export const step3Schema = z.object({
  workRelation: z.enum(["CLT","PJ","LIBERAL","CONCURSADO","OUTRO"], {
    errorMap: () => ({ message: "Selecione a relação trabalhista" }),
  }),
  workDetails: z.string().min(1, "Preencha ou escreva NÃO"),
  commercialAddress: z.string().min(3, "Endereço comercial é obrigatório"),
  practiceAreas: z.string().min(2, "Área(s) de atuação é obrigatória"),
  graduationInstitution: z.string().min(2, "Instituição é obrigatória"),
  graduationYear: z.coerce.number().min(1970, "Ano inválido").max(2030, "Ano inválido"),
});

export const step4Schema = z.object({
  specialization: z.string().min(1, "Preencha ou escreva NÃO"),
  masters: z.string().min(1, "Preencha ou escreva NÃO"),
  doctorate: z.string().min(1, "Preencha ou escreva NÃO"),
  postDoctorate: z.string().min(1, "Preencha ou escreva NÃO"),
});

export const lgpdSchema = z.object({
  lgpdConsent: z.literal(true, {
    errorMap: () => ({ message: "O consentimento LGPD é obrigatório para prosseguir" }),
  }),
});

export const fullApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(lgpdSchema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type ApplicationFormData = z.infer<typeof fullApplicationSchema>;
