revoke all on table public.admin_members from service_role;
grant select, insert, update, delete on table public.admin_members to service_role;

revoke all on table public.admin_audit_log from service_role;
grant select, insert on table public.admin_audit_log to service_role;

revoke all on sequence public.admin_audit_log_id_seq from service_role;
grant usage, select on sequence public.admin_audit_log_id_seq to service_role;
