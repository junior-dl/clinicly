DROP INDEX "client_ws_email_uq";--> statement-breakpoint
CREATE INDEX "client_ws_email_idx" ON "client" USING btree ("workspace_id","email");