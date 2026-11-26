import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Two connections:
 * - `dbAdmin`  → table owner. Bypasses RLS. Only for auth, Stripe webhooks and
 *                workspace bootstrap (signup), where there is no tenant yet.
 * - `dbApp`    → restricted `clinicly_app` role. RLS always applies. Every
 *                tenant query goes through `withTenant()` below.
 */
const adminPool = new Pool({ connectionString: process.env.DATABASE_URL });
const appPool = new Pool({
  connectionString: process.env.DATABASE_URL_APP || process.env.DATABASE_URL,
});

export const dbAdmin = drizzle(adminPool, { schema });
const dbApp = drizzle(appPool, { schema });

export type TenantRole = "owner" | "admin" | "staff" | "visitor";

export interface TenantContext {
  workspaceId: string;
  role: TenantRole;
  userId?: string;
  memberId?: string;
}

export type TenantTx = Parameters<Parameters<typeof dbApp.transaction>[0]>[0];

/**
 * Runs `fn` in a transaction whose Postgres session variables identify the
 * tenant and caller. RLS policies read these via current_setting('app.*').
 * `set_config(..., true)` scopes them to this transaction only, so pooled
 * connections never leak one tenant's context into another request.
 */
export async function withTenant<T>(
  ctx: TenantContext,
  fn: (tx: TenantTx) => Promise<T>,
): Promise<T> {
  return dbApp.transaction(async (tx) => {
    await tx.execute(sql`
      select
        set_config('app.workspace_id', ${ctx.workspaceId}, true),
        set_config('app.role',         ${ctx.role}, true),
        set_config('app.user_id',      ${ctx.userId ?? ""}, true),
        set_config('app.member_id',    ${ctx.memberId ?? ""}, true)
    `);
    return fn(tx);
  });
}

export { schema };
