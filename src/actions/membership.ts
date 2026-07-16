"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fullApplicationSchema,
  type ApplicationFormData,
} from "@/validations/application";
import type { DocumentType } from "@/types/database";
import { USER_ERRORS } from "@/lib/errors";
import { validateUploadFile } from "@/lib/file-validation";
import { LGPD_VERSION } from "@/lib/lgpd";
import { serverLog } from "@/lib/log";
import { notifySecretary } from "@/server/services/notifications.service";

// ── Criar solicitação completa ────────────────────────────────────────────────
export async function createMembershipRequest(data: ApplicationFormData) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: "Não autenticado." };

  // Validação server-side: não confiar no client. Retornamos a primeira
  // mensagem de erro para exibir de forma amigável.
  const parsed = fullApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path?.join(".") ?? "campo";
    serverLog.warn("createMembershipRequest: validação falhou", {
      userId: user.id,
      fields: parsed.error.issues.map((i) => i.path.join(".")),
    });
    return {
      error: first?.message
        ? `${first.message} (${field}).`
        : "Dados inválidos. Revise o formulário.",
    };
  }
  data = parsed.data;

  if (data.email.trim().toLowerCase() !== user.email?.trim().toLowerCase()) {
    return { error: "Use o mesmo e-mail da sua conta para enviar a solicitação." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRequest } = await (supabase as any)
    .from("membership_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .neq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingRequest) {
    return {
      error: "Você já possui uma solicitação em andamento. Acompanhe pelo portal.",
    };
  }

  const profilePayload = {
    user_id: user.id,
    full_name: data.fullName,
    cpf: data.cpf,
    crfa_or_student_info: data.crfaOrStudentInfo,
    birth_date: data.birthDate,
    email: data.email,
    phone: data.phone,
    rg: data.rg,
    issuing_agency: data.issuingAgency,
    filiacao: data.filiacao,
    marital_status: data.maritalStatus,
    nationality: data.nationality,
    birthplace: data.birthplace,
    residential_street: data.residentialStreet,
    residential_number: data.residentialNumber,
    residential_complement: data.residentialComplement ?? null,
    residential_neighborhood: data.residentialNeighborhood,
    residential_city: data.residentialCity,
    residential_state: "CE",
    residential_cep: data.residentialCep,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileErr } = await (supabase as any)
    .from("profiles")
    .upsert(profilePayload, { onConflict: "user_id" })
    .select()
    .single();

  if (profileErr) {
    serverLog.error("createMembershipRequest: erro ao salvar perfil", {
      userId: user.id,
      code: profileErr.code,
      message: profileErr.message,
    });
    return { error: USER_ERRORS.profileSave };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: request, error: requestErr } = await (supabase as any)
    .from("membership_requests")
    .insert({
      user_id: user.id,
      profile_id: profile.id,
      status: "documents_pending",
      work_relation: data.workRelation,
      work_details: data.workDetails,
      commercial_address: data.commercialAddress,
      practice_areas: data.practiceAreas,
      graduation_institution: data.graduationInstitution,
      graduation_year: data.graduationYear,
      specialization: data.specialization ?? null,
      masters: data.masters ?? null,
      doctorate: data.doctorate ?? null,
      post_doctorate: data.postDoctorate ?? null,
      lgpd_consent: data.lgpdConsent,
      lgpd_consent_at: new Date().toISOString(),
      lgpd_consent_version: LGPD_VERSION,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (requestErr) {
    serverLog.error("createMembershipRequest: erro ao criar solicitação", {
      userId: user.id,
      code: requestErr.code,
      message: requestErr.message,
    });
    return { error: USER_ERRORS.requestCreate };
  }

  return { requestId: request.id as string };
}

// ── Upload de documento ────────────────────────────────────────────────────────
export async function uploadDocument(
  requestId: string,
  documentType: DocumentType,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: "Não autenticado." };

  // UUID básico: o storage aceita qualquer string, mas o path é derivado
  // de requestId. Sem validação de formato + ownership, um caller poderia
  // gravar em uma pasta arbitrária.
  if (!requestId || typeof requestId !== "string" || requestId.length > 64) {
    return { error: "Identificador de solicitação inválido." };
  }

  // Verifica que a solicitação existe E pertence ao usuário. Se não pertence,
  // RLS já retornaria vazio, mas conferimos explicitamente para dar erro claro.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: request, error: requestErr } = await (supabase as any)
    .from("membership_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (requestErr) return { error: USER_ERRORS.requestValidate };
  if (!request) return { error: "Solicitação não encontrada ou sem permissão." };

  // Uma vez enviada e sob análise/aprovada, o usuário só pode reenviar via
  // resubmitDocument quando o admin pediu correção.
  const uploadable: string[] = ["draft", "documents_pending", "correction_requested"];
  if (!uploadable.includes(request.status)) {
    return { error: "Esta solicitação não aceita novos envios no momento." };
  }

  const rawFile = formData.get("file");
  if (!(rawFile instanceof File)) {
    return { error: "Nenhum arquivo enviado." };
  }
  const fileCheck = await validateUploadFile(rawFile);
  if (!fileCheck.ok) return { error: fileCheck.error };

  const ext = fileCheck.mime === "application/pdf" ? "pdf" : fileCheck.mime === "image/png" ? "png" : "jpg";
  const safeName = `${documentType}_${Date.now()}.${ext}`;
  const filePath = `${user.id}/${requestId}/${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from("membership-documents")
    .upload(filePath, rawFile, { contentType: fileCheck.mime, upsert: false });

  if (uploadErr) {
    serverLog.error("uploadDocument: falha no storage", {
      userId: user.id,
      requestId,
      documentType,
      message: uploadErr.message,
    });
    return { error: USER_ERRORS.uploadStorage };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbErr } = await (supabase as any).from("documents").insert({
    membership_request_id: requestId,
    user_id: user.id,
    document_type: documentType,
    file_name: rawFile.name,
    file_path: filePath,
    file_size: rawFile.size,
    mime_type: fileCheck.mime,
    status: "pending",
  });

  if (dbErr) {
    serverLog.error("uploadDocument: falha ao registrar em documents", {
      userId: user.id,
      requestId,
      documentType,
      code: dbErr.code,
      message: dbErr.message,
    });
    await supabase.storage.from("membership-documents").remove([filePath]);
    return { error: USER_ERRORS.uploadRegister };
  }

  revalidatePath("/portal");
  return { success: true, filePath };
}

// ── Submeter solicitação ─────────────────────────────────────────────────────
export async function submitMembershipRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: "Não autenticado." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: requestRow, error: fetchErr } = await (supabase as any)
    .from("membership_requests")
    .select("id, created_at, profiles(full_name, email, phone)")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .in("status", ["draft", "documents_pending"])
    .maybeSingle();

  if (fetchErr || !requestRow) {
    return { error: "Solicitação não encontrada ou já enviada." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("membership_requests")
    .update({ status: "under_review", submitted_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("user_id", user.id)
    .in("status", ["draft", "documents_pending"]);

  if (error) {
    serverLog.error("submitMembershipRequest: falha ao atualizar status", {
      userId: user.id,
      requestId,
      message: error.message,
    });
    return { error: USER_ERRORS.requestCreate };
  }

  const profile = Array.isArray(requestRow.profiles)
    ? requestRow.profiles[0]
    : requestRow.profiles;

  void notifySecretary({
    applicationId: requestRow.id,
    fullName: profile?.full_name ?? "—",
    email: profile?.email ?? user.email ?? "—",
    phone: profile?.phone ?? "—",
    createdAt: new Date(requestRow.created_at),
  }).catch((err) => {
    serverLog.error("submitMembershipRequest: notificação à secretaria falhou", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  });

  revalidatePath("/portal");
  return { success: true };
}

// ── Buscar URL assinada ───────────────────────────────────────────────────────
// Autorização: só devolvemos URL se o caller for autenticado E puder ver o
// registro correspondente em `documents` (RLS permite: dono do arquivo OU admin).
// Sem esta verificação, qualquer usuário autenticado conseguiria gerar URLs
// assinadas para arquivos de terceiros conhecendo apenas o caminho.
export async function getDocumentSignedUrl(filePath: string) {
  if (!filePath || typeof filePath !== "string") return null;

  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: doc, error: docErr } = await (supabase as any)
    .from("documents")
    .select("id, file_path")
    .eq("file_path", filePath)
    .maybeSingle();

  if (docErr || !doc) return null;

  const { data } = await supabase.storage
    .from("membership-documents")
    .createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}

// ── Reenviar documento ────────────────────────────────────────────────────────
export async function resubmitDocument(
  oldDocumentId: string,
  requestId: string,
  documentType: DocumentType,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: oldDoc, error: oldDocErr } = await (supabase as any)
    .from("documents")
    .select("id, file_path, status, membership_request_id")
    .eq("id", oldDocumentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (oldDocErr) {
    serverLog.error("resubmitDocument: erro ao localizar documento", {
      userId: user.id,
      documentId: oldDocumentId,
      message: oldDocErr.message,
    });
    return { error: USER_ERRORS.documentLocate };
  }
  if (!oldDoc) return { error: "Documento não encontrado ou sem permissão." };
  if (oldDoc.membership_request_id !== requestId) {
    return { error: "Documento não pertence a esta solicitação." };
  }
  if (oldDoc.status !== "correction_needed") {
    return { error: "Este documento não está aguardando correção." };
  }

  if (oldDoc.file_path) {
    const { error: storageErr } = await supabase.storage
      .from("membership-documents")
      .remove([oldDoc.file_path]);
    if (storageErr) {
      serverLog.error("resubmitDocument: falha ao remover arquivo antigo", {
        userId: user.id,
        message: storageErr.message,
      });
      return { error: USER_ERRORS.documentRemove };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteErr } = await (supabase as any)
    .from("documents")
    .delete()
    .eq("id", oldDocumentId);
  if (deleteErr) {
    serverLog.error("resubmitDocument: falha ao remover registro antigo", {
      userId: user.id,
      message: deleteErr.message,
    });
    return { error: USER_ERRORS.documentRemove };
  }

  const result = await uploadDocument(requestId, documentType, formData);
  if (result.error) return result;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: docs } = await (supabase as any)
    .from("documents")
    .select("status")
    .eq("membership_request_id", requestId);

  const allOk = (docs as { status: string }[] | null)?.every((d) => d.status !== "correction_needed") ?? false;
  if (allOk) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("membership_requests")
      .update({ status: "under_review" })
      .eq("id", requestId)
      .eq("user_id", user.id);
  }

  revalidatePath("/portal");
  return { success: true };
}
