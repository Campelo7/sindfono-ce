import type { ApplicationFormData } from "@/validations/application";

/** Payload válido para `fullApplicationSchema` nos testes de server actions. */
export const validApplicationFixture: ApplicationFormData = {
  fullName: "Maria Silva",
  phone: "85987654321",
  email: "maria@email.com",
  crfaOrStudentInfo: "CRFa 12345",
  birthDate: "1990-01-15",
  cpf: "52998224725",
  rg: "1234567",
  issuingAgency: "SSP-CE",
  filiacao: "João e Maria Silva",
  maritalStatus: "SOLTEIRO",
  nationality: "Brasileira",
  birthplace: "Fortaleza",
  residentialStreet: "Rua das Flores",
  residentialNumber: "100",
  residentialComplement: "Apto 101",
  residentialNeighborhood: "Centro",
  residentialCity: "Fortaleza",
  residentialCep: "60000000",
  workRelation: "CLT",
  workDetails: "Hospital Regional",
  commercialAddress: "Av. Beira Mar 500",
  practiceAreas: "Audiologia clínica",
  graduationInstitution: "UFC",
  graduationYear: 2015,
  specialization: "NÃO",
  masters: "NÃO",
  doctorate: "NÃO",
  postDoctorate: "NÃO",
  lgpdConsent: true,
};

export const REQUEST_ID = "req-33333333-3333-3333-3333-333333333333";
export const PROFILE_ID = "prof-44444444-4444-4444-4444-444444444444";
export const PAYMENT_ID = "pay-55555555-5555-5555-5555-555555555555";
export const DOCUMENT_ID = "doc-66666666-6666-6666-6666-666666666666";

export function makePdfFile(name = "doc.pdf", sizeBytes = 1024): File {
  const blob = new Blob(["%PDF-test"], { type: "application/pdf" });
  return new File([blob], name, { type: "application/pdf" });
}

export function makeFormDataWithFile(file: File): FormData {
  const fd = new FormData();
  fd.append("file", file);
  return fd;
}
