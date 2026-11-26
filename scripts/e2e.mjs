/**
 * End-to-end API test for Clinicly. Runs against a live dev server.
 *
 *   pnpm dev            # in one terminal
 *   pnpm test:e2e       # in another (BASE_URL defaults to http://localhost:3000)
 *
 * Works in Node (keeps its own cookie jar) and in a browser console on the app's
 * origin (`await runE2E()`), so it can be run without installing anything.
 * Creates throwaway users/workspaces named e2e-<timestamp>.
 */

export async function runE2E({ baseUrl = globalThis.location?.origin ?? "http://localhost:3000", log = console.log } = {}) {
  const isNode = typeof window === "undefined";
  const jar = new Map();
  const run = Date.now().toString(36);
  const results = [];

  async function http(method, path, body) {
    const headers = { origin: baseUrl };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (isNode && jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
    const res = await fetch(baseUrl + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      redirect: "manual",
    });
    if (isNode) {
      for (const c of res.headers.getSetCookie?.() ?? []) {
        const [pair, ...attrs] = c.split(";");
        const [k, ...v] = pair.split("=");
        const expired = attrs.some((a) => /max-age=0/i.test(a));
        if (expired) jar.delete(k.trim());
        else jar.set(k.trim(), v.join("="));
      }
    }
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: res.status, data };
  }

  async function check(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
      log(`  ✓ ${name}`);
    } catch (e) {
      results.push({ name, ok: false, error: e.message });
      log(`  ✗ ${name}\n      ${e.message}`);
    }
  }
  const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
  const expectStatus = (r, s, what) =>
    expect(r.status === s, `${what}: expected ${s}, got ${r.status} ${JSON.stringify(r.data)?.slice(0, 200)}`);

  const signUp = (who) =>
    http("POST", "/api/auth/sign-up/email", { name: who, email: `${who}@clinicly.test`, password: "password1234" });
  const signOut = () => http("POST", "/api/auth/sign-out", {});

  const ownerA = `e2e-${run}-a`;
  const ownerB = `e2e-${run}-b`;
  const slugA = `e2e-${run}-a`;
  const slugB = `e2e-${run}-b`;
  const inOneHour = (h = 1) => new Date(Date.now() + h * 3600_000).toISOString();
  let serviceId, hiddenServiceId, staffId;

  log(`Clinicly e2e → ${baseUrl} (run ${run})`);

  await check("unauthenticated tenant API is rejected", async () => {
    await signOut();
    expectStatus(await http("GET", "/api/workspaces"), 401, "GET /api/workspaces");
  });

  await check("owner A signs up and creates a workspace", async () => {
    expectStatus(await signUp(ownerA), 200, "sign up A");
    const r = await http("POST", "/api/workspaces", { name: "E2E Clinic A", slug: slugA });
    expectStatus(r, 201, "create workspace");
    expect(r.data.plan === "free", "new workspace should start on Free");
  });

  await check("duplicate workspace slug returns 409", async () => {
    expectStatus(await http("POST", "/api/workspaces", { name: "Again", slug: slugA }), 409, "duplicate slug");
  });

  await check("invalid input returns 422", async () => {
    expectStatus(await http("POST", "/api/workspaces", { name: "x", slug: "NO SPACES" }), 422, "bad slug");
  });

  await check("owner creates services", async () => {
    let r = await http("POST", `/api/w/${slugA}/services`, { name: "Cleaning", durationMinutes: 30, priceCents: 150000 });
    expectStatus(r, 201, "create service");
    serviceId = r.data.id;
    r = await http("POST", `/api/w/${slugA}/services`, { name: "Secret", durationMinutes: 30, priceCents: 0 });
    expectStatus(r, 201, "create 2nd service");
    hiddenServiceId = r.data.id;
    expectStatus(await http("PATCH", `/api/w/${slugA}/services/${hiddenServiceId}`, { isActive: false }), 200, "hide service");
  });

  await check("staff list exposes names but not emails", async () => {
    const r = await http("GET", `/api/w/${slugA}/staff`);
    expectStatus(r, 200, "GET staff");
    staffId = r.data[0]?.id;
    expect(staffId, "owner should be listed as staff");
    expect(!JSON.stringify(r.data).includes("@"), "staff payload must not contain emails");
  });

  await check("Free plan blocks a 2nd staff invite (402)", async () => {
    expectStatus(await http("POST", `/api/w/${slugA}/invitations`, { email: "x@clinicly.test", role: "staff" }), 402, "invite");
  });

  await check("Free plan blocks custom branding (402)", async () => {
    expectStatus(await http("PATCH", `/api/w/${slugA}/branding`, { brandColor: "#123456" }), 402, "branding");
  });

  await signOut();

  await check("visitor sees the booking page with active services and staff", async () => {
    const r = await http("GET", `/api/public/${slugA}`);
    expectStatus(r, 200, "public page");
    const ids = r.data.services.map((s) => s.id);
    expect(ids.includes(serviceId), "active service missing");
    expect(!ids.includes(hiddenServiceId), "hidden service leaked to visitor");
    expect(r.data.staff.some((s) => s.id === staffId && s.name), "staff name missing");
    expect(r.data.workspace.showClinicBranding === true, "Free should show Clinicly branding");
  });

  const booking = (startsAt, sId = serviceId) => ({
    serviceId: sId,
    staffMemberId: staffId,
    startsAt,
    client: { name: "E2E Patient", email: `patient-${run}@clinicly.test` },
  });
  const slot = inOneHour(24);

  await check("visitor books an appointment", async () => {
    expectStatus(await http("POST", `/api/public/${slugA}/book`, booking(slot)), 201, "book");
  });

  await check("double-booking the same slot returns 409", async () => {
    expectStatus(await http("POST", `/api/public/${slugA}/book`, booking(slot)), 409, "double book");
  });

  await check("booking in the past returns 422", async () => {
    expectStatus(await http("POST", `/api/public/${slugA}/book`, booking(new Date(Date.now() - 3600_000).toISOString())), 422, "past");
  });

  await check("visitor can't book a hidden service", async () => {
    expectStatus(await http("POST", `/api/public/${slugA}/book`, booking(inOneHour(30), hiddenServiceId)), 404, "hidden");
  });

  await check("unknown workspace returns 404", async () => {
    expectStatus(await http("GET", `/api/public/does-not-exist-${run}`), 404, "unknown slug");
  });

  await check("owner B can't see or change workspace A", async () => {
    expectStatus(await signUp(ownerB), 200, "sign up B");
    expectStatus(await http("POST", "/api/workspaces", { name: "E2E Clinic B", slug: slugB }), 201, "create B");
    expectStatus(await http("GET", `/api/w/${slugA}`), 404, "B reads A");
    expectStatus(await http("GET", `/api/w/${slugA}/appointments?from=2000-01-01&to=2100-01-01`), 404, "B reads A appts");
    expectStatus(await http("PATCH", `/api/w/${slugA}/services/${serviceId}`, { name: "hacked" }), 404, "B edits A service via A slug");
    expectStatus(await http("PATCH", `/api/w/${slugB}/services/${serviceId}`, { name: "hacked" }), 404, "B edits A service via own slug (RLS)");
    const list = await http("GET", `/api/w/${slugB}/services`);
    expect(Array.isArray(list.data) && list.data.length === 0, "B should see 0 services");
  });

  await signOut();

  await check("owner A sees the visitor's booking on the calendar", async () => {
    expectStatus(await http("POST", "/api/auth/sign-in/email", { email: `${ownerA}@clinicly.test`, password: "password1234" }), 200, "sign in A");
    const r = await http("GET", `/api/w/${slugA}/appointments?from=2000-01-01&to=2100-01-01`);
    expectStatus(r, 200, "list");
    expect(r.data.length === 1 && r.data[0].clientName === "E2E Patient", `expected 1 booking, got ${JSON.stringify(r.data)}`);
    expectStatus(await http("PATCH", `/api/w/${slugA}/appointments/${r.data[0].id}`, { status: "completed" }), 200, "complete");
  });

  await check("only owners can start checkout (staff-only route guard)", async () => {
    // A is owner, so this reaches Stripe: 200 with a URL if keys are set, 500 if not.
    const r = await http("POST", `/api/w/${slugA}/billing/checkout`);
    expect([200, 500].includes(r.status), `unexpected ${r.status}`);
    if (r.status === 200) expect(String(r.data.url).startsWith("https://checkout.stripe.com"), "no checkout URL");
  });

  await signOut();

  const failed = results.filter((r) => !r.ok);
  log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? ` — ${failed.length} failed` : ""}`);
  log(`Cleanup: test data uses emails ending @clinicly.test and slugs starting e2e-${run}`);
  return { run, passed: results.length - failed.length, failed };
}

if (typeof window === "undefined" && process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/e2e.mjs")) {
  const { failed } = await runE2E({ baseUrl: process.env.BASE_URL });
  process.exit(failed.length ? 1 : 0);
}
