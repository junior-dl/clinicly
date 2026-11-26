-- The public booking page and staff lists join member → user for display names.
-- Grant only the columns needed (never email/image), and scope rows with RLS so a
-- tenant can only read names of users who are members of the workspace in context.
GRANT SELECT (id, name) ON "user" TO clinicly_app;
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY user_names_in_tenant ON "user" FOR SELECT TO clinicly_app
  USING (EXISTS (SELECT 1 FROM member m WHERE m.user_id = "user".id AND m.workspace_id = app_ws()));
