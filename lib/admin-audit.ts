import type { AdminUser } from "@/lib/admin-access";
import { supabaseAdminInsert } from "@/lib/supabase";

type AuditDocument = Record<string, unknown> | null;

export type AdminAuditInput = {
  actor: AdminUser;
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  before?: AuditDocument;
  after?: AuditDocument;
  requestId?: string | null;
};

function changedFields(before: AuditDocument, after: AuditDocument) {
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  return [...keys].filter((key) =>
    JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]),
  );
}

export async function writeAdminAudit({
  actor,
  action,
  resourceType,
  resourceId = null,
  before = null,
  after = null,
  requestId = null,
}: AdminAuditInput) {
  await supabaseAdminInsert("admin_audit_log", {
    actor_user_id: actor.id,
    actor_role: actor.role,
    action,
    resource_type: resourceType,
    resource_id: resourceId == null ? null : String(resourceId),
    before_data: before,
    after_data: after,
    changed_fields: changedFields(before, after),
    request_id: requestId,
  });
}
