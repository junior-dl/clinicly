-- Row-level security for tenant isolation.
-- The app connects as `clinicly_app` (no BYPASSRLS). withTenant() sets
-- app.workspace_id / app.role / app.user_id / app.member_id per transaction.
-- The login password is set outside migrations (see README → Database setup).

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'clinicly_app') THEN
    CREATE ROLE clinicly_app NOLOGIN;
  END IF;
END $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO clinicly_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace, member, invitation, service, client, appointment TO clinicly_app;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION app_ws() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.workspace_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_role() RETURNS text LANGUAGE sql STABLE AS
$$ SELECT coalesce(nullif(current_setting('app.role', true), ''), 'none') $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_member() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.member_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_is_manager() RETURNS boolean LANGUAGE sql STABLE AS
$$ SELECT app_role() IN ('owner', 'admin') $$;
--> statement-breakpoint

ALTER TABLE workspace   ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE member      ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE invitation  ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE service     ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE client      ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE appointment ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- workspace: everyone in context can read their own workspace; only owner edits
CREATE POLICY ws_select ON workspace FOR SELECT TO clinicly_app USING (id = app_ws());--> statement-breakpoint
CREATE POLICY ws_update ON workspace FOR UPDATE TO clinicly_app
  USING (id = app_ws() AND app_role() = 'owner') WITH CHECK (id = app_ws());--> statement-breakpoint

-- member: readable in-tenant (visitors need staff names to pick a provider); managers edit
CREATE POLICY member_select ON member FOR SELECT TO clinicly_app USING (workspace_id = app_ws());--> statement-breakpoint
CREATE POLICY member_write ON member FOR ALL TO clinicly_app
  USING (workspace_id = app_ws() AND app_is_manager())
  WITH CHECK (workspace_id = app_ws() AND app_is_manager());--> statement-breakpoint

-- invitation: owner only (billing/invites)
CREATE POLICY invitation_owner ON invitation FOR ALL TO clinicly_app
  USING (workspace_id = app_ws() AND app_role() = 'owner')
  WITH CHECK (workspace_id = app_ws() AND app_role() = 'owner');--> statement-breakpoint

-- service: staff see all, visitors see active only; managers edit
CREATE POLICY service_select ON service FOR SELECT TO clinicly_app
  USING (workspace_id = app_ws() AND (app_role() <> 'visitor' OR is_active));--> statement-breakpoint
CREATE POLICY service_write ON service FOR ALL TO clinicly_app
  USING (workspace_id = app_ws() AND app_is_manager())
  WITH CHECK (workspace_id = app_ws() AND app_is_manager());--> statement-breakpoint

-- client: managers see all; staff only clients they have appointments with; visitors may only insert
CREATE POLICY client_select ON client FOR SELECT TO clinicly_app
  USING (workspace_id = app_ws() AND (
    app_is_manager()
    OR (app_role() = 'staff' AND EXISTS (
      SELECT 1 FROM appointment a WHERE a.client_id = client.id AND a.staff_member_id = app_member()))
  ));--> statement-breakpoint
CREATE POLICY client_insert ON client FOR INSERT TO clinicly_app
  WITH CHECK (workspace_id = app_ws() AND app_role() IN ('owner', 'admin', 'staff', 'visitor'));--> statement-breakpoint
CREATE POLICY client_update ON client FOR UPDATE TO clinicly_app
  USING (workspace_id = app_ws() AND app_is_manager()) WITH CHECK (workspace_id = app_ws());--> statement-breakpoint

-- appointment: managers all; staff only their own calendar; visitors insert only
CREATE POLICY appt_select ON appointment FOR SELECT TO clinicly_app
  USING (workspace_id = app_ws() AND (app_is_manager() OR staff_member_id = app_member()));--> statement-breakpoint
CREATE POLICY appt_insert ON appointment FOR INSERT TO clinicly_app
  WITH CHECK (workspace_id = app_ws() AND (
    app_is_manager() OR app_role() = 'visitor' OR staff_member_id = app_member()));--> statement-breakpoint
CREATE POLICY appt_update ON appointment FOR UPDATE TO clinicly_app
  USING (workspace_id = app_ws() AND (app_is_manager() OR staff_member_id = app_member()))
  WITH CHECK (workspace_id = app_ws());--> statement-breakpoint
CREATE POLICY appt_delete ON appointment FOR DELETE TO clinicly_app
  USING (workspace_id = app_ws() AND app_is_manager());--> statement-breakpoint

-- Plan-limit + double-booking checks need counts across rows the caller may not see
-- (e.g. a visitor). SECURITY DEFINER keeps those checks exact without widening RLS.
CREATE OR REPLACE FUNCTION workspace_month_booking_count(ws uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM appointment
  WHERE workspace_id = ws AND status <> 'cancelled'
    AND created_at >= date_trunc('month', now())
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION staff_has_overlap(staff uuid, s timestamptz, e timestamptz) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM appointment
    WHERE staff_member_id = staff AND status = 'booked' AND starts_at < e AND ends_at > s)
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION workspace_month_booking_count(uuid), staff_has_overlap(uuid, timestamptz, timestamptz) TO clinicly_app;
