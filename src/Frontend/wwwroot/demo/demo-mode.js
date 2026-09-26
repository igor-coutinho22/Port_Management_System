// Demo mode: runs the SPA without backends or sign-in, answering API requests with the sample
// data from demo-data.js. Enabled on the public demo (GitHub Pages) or with ?demo in the URL;
// otherwise inert.
(function () {
    const params = new URLSearchParams(window.location.search);
    const host = window.location.hostname;
    const enabled = params.has("demo") || host.endsWith(".github.io");
    if (!enabled || !window.DEMO_DATA) return;

    window.APP_CONFIG = Object.assign({}, window.APP_CONFIG, { demoMode: true });

    const DATA_DATE = "2026-09-25"; // day the sample data was generated
    const DAY_MS = 24 * 60 * 60 * 1000;

    // ---- Shift every date in the sample data so the demo always looks current ----
    const today = new Date();
    const offsetDays = Math.round(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.parse(DATA_DATE + "T00:00:00Z")) / DAY_MS
    );
    const shiftDate = (datePart) => new Date(Date.parse(datePart + "T00:00:00Z") + offsetDays * DAY_MS).toISOString().slice(0, 10);
    const shiftDates = (value) => {
        if (typeof value === "string") {
            const m = /^(\d{4}-\d{2}-\d{2})(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/.exec(value);
            return m ? shiftDate(m[1]) + (m[2] || "") : value;
        }
        if (Array.isArray(value)) return value.map(shiftDates);
        if (value && typeof value === "object") {
            const out = {};
            Object.keys(value).forEach((k) => { out[k] = shiftDates(value[k]); });
            return out;
        }
        return value;
    };
    const db = shiftDates(window.DEMO_DATA);
    const todayStr = shiftDate(DATA_DATE);

    // ---- Demo user (all roles, so every area of the app can be explored) ----
    const user = {
        email: "demo@sinesport.pt",
        firstName: "Demo",
        lastName: "User",
        name: "Demo User",
        roles: ["Admin", "Officer", "Operator", "Representative"],
        organizationId: db.organizations[0] && db.organizations[0].id,
    };

    // ---- MSAL replacement: the user is always signed in ----
    const account = { username: user.email, name: user.name, homeAccountId: "demo", localAccountId: "demo", environment: "demo", tenantId: "demo" };
    window.__pca = {
        initialize: () => Promise.resolve(),
        getAllAccounts: () => [account],
        getActiveAccount: () => account,
        setActiveAccount: () => { },
        handleRedirectPromise: () => Promise.resolve(null),
        addEventCallback: () => null,
        removeEventCallback: () => { },
        acquireTokenSilent: () => Promise.resolve({ accessToken: "demo-token", account }),
        acquireTokenRedirect: () => Promise.resolve(),
        acquireTokenPopup: () => Promise.resolve({ accessToken: "demo-token", account }),
        loginRedirect: () => Promise.resolve(),
        loginPopup: () => Promise.resolve({ account }),
        logoutRedirect: () => { window.location.reload(); return Promise.resolve(); },
        logoutPopup: () => Promise.resolve(),
    };
    window.__msalReady = Promise.resolve();

    // ---- Helpers ----
    const lower = (v) => String(v == null ? "" : v).toLowerCase();
    const DATE_PARAMS = ["from", "to", "fromdate", "todate", "start", "end", "startdate", "enddate", "date"];

    // Keeps the items whose fields contain every (non-date) query value; unknown params are ignored.
    const search = (items, query) => items.filter((item) => {
        const flat = Object.assign({}, item, item.storageArea || {});
        for (const [key, value] of query.entries()) {
            if (!value || DATE_PARAMS.includes(lower(key))) continue;
            const fields = Object.keys(flat).filter((f) => lower(f).includes(lower(key)) || lower(key).includes(lower(f)));
            if (fields.length === 0) continue;
            const hit = fields.some((f) => lower(typeof flat[f] === "object" ? JSON.stringify(flat[f]) : flat[f]).includes(lower(value)));
            if (!hit) return false;
        }
        return true;
    });
    const byId = (items, id, ...keys) => items.find((i) => (keys.length ? keys : ["id"]).some((k) => lower(i[k]) === lower(id)));
    const storageAreaById = (id) => db.storageAreas.find((s) => lower(s.storageArea.id) === lower(id));

    // Builds a plausible daily schedule from the approved visits (the real one is computed in Prolog).
    const buildSchedule = (heuristicName, cranes) => {
        const dockFree = {};
        let totalDelay = 0;
        const entries = db.vvns
            .filter((v) => v.status === "Approved")
            .sort((a, b) => Date.parse(a.arrivalTime) - Date.parse(b.arrivalTime))
            .map((v) => {
                const duration = ((v.estimatedUnloadingDurationMinutes || 0) + (v.estimatedLoadingDurationMinutes || 0)) / cranes;
                const start = Math.max(Date.parse(v.arrivalTime), dockFree[v.dockId] || 0);
                const end = start + duration * 60000;
                dockFree[v.dockId] = end;
                const delayMinutes = Math.max(0, Math.round((end - Date.parse(v.desiredDepartureTime)) / 60000));
                totalDelay += delayMinutes;
                return {
                    vesselVisitId: v.id, vesselIMO: v.vesselIMO,
                    startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString(),
                    assignedCraneId: "R001", numberOfCranes: cranes, staffMecNumbers: ["S001"], delayMinutes,
                };
            });
        return { targetDate: todayStr, heuristicName, totalDelayMinutes: totalDelay, runtimeSeconds: 0.4, entries, warnings: [] };
    };

    // ---- Routes (paths relative to /api, matched case-insensitively) ----
    const routes = [
        ["GET", /^\/me$/, () => user],
        ["GET", /^\/admin\/users$/, (m, q) => search(db.adminUsers, new URLSearchParams(q.get("q") ? { email: q.get("q") } : {}))],
        ["GET", /^\/admin\/users\/([^/]+)$/, (m) => byId(db.adminUsers, decodeURIComponent(m[1]), "email", "id")],

        ["GET", /^\/docks$/, () => db.docks],
        ["GET", /^\/docks\/search$/, (m, q) => search(db.docks, q)],
        ["GET", /^\/docks\/([^/]+)$/, (m) => byId(db.docks, m[1])],

        ["GET", /^\/vessels$/, () => db.vessels],
        ["GET", /^\/vessels\/getbyimo\/([^/]+)$/, (m) => byId(db.vessels, m[1], "imo")],
        ["GET", /^\/vessels\/searchbynameandoperator$/, (m, q) => search(db.vessels, q)],

        ["GET", /^\/vesseltypes$/, () => db.vesselTypes],
        ["GET", /^\/vesseltypes\/search$/, (m, q) => search(db.vesselTypes, q)],
        ["GET", /^\/vesseltypes\/getbyname\/([^/]+)$/, (m) => byId(db.vesselTypes, decodeURIComponent(m[1]), "name")],

        ["GET", /^\/storageareas$/, () => db.storageAreas],
        ["GET", /^\/storageareas\/getbyid\/([^/]+)$/, (m) => storageAreaById(m[1])],
        ["GET", /^\/storageareas\/getbyname\/([^/]+)$/, (m) => db.storageAreas.find((s) => lower(s.storageArea.name) === lower(decodeURIComponent(m[1])))],
        ["GET", /^\/storageareas\/([^/]+)\/connections$/, (m) => (storageAreaById(m[1]) || { storageArea: { dockConnections: [] } }).storageArea.dockConnections],
        ["GET", /^\/storageareas\/([^/]+)\/connection\/([^/]+)$/, (m) => ((storageAreaById(m[1]) || { storageArea: { dockConnections: [] } }).storageArea.dockConnections || []).find((c) => lower(c.dockId) === lower(m[2]))],

        ["GET", /^\/resources$/, (m, q) => search(db.resources, q)],
        ["GET", /^\/resources\/([^/]+)$/, (m) => byId(db.resources, m[1])],
        ["GET", /^\/staff$/, (m, q) => search(db.staff, q)],
        ["GET", /^\/staff\/([^/]+)$/, (m) => byId(db.staff, m[1], "mecanographicNumber")],
        ["GET", /^\/qualifications$/, () => db.qualifications],
        ["GET", /^\/qualifications\/([^/]+)$/, (m) => byId(db.qualifications, decodeURIComponent(m[1]), "code")],

        ["GET", /^\/organizations$/, () => db.organizations],
        ["GET", /^\/organizations\/([^/]+)$/, (m) => byId(db.organizations, m[1])],
        ["GET", /^\/representatives\/all$/, () => db.representatives],
        ["GET", /^\/representatives$/, (m, q) => db.representatives.filter((r) => !q.get("orgId") || lower(r.organizationId) === lower(q.get("orgId")))],
        ["GET", /^\/representatives\/([^/]+)$/, (m) => byId(db.representatives, m[1])],

        ["GET", /^\/vesselvisitnotification$/, () => db.vvns],
        ["GET", /^\/vesselvisitnotification\/search$/, (m, q) => search(db.vvns, q)],
        ["GET", /^\/vesselvisitnotification\/([^/]+)$/, (m) => byId(db.vvns, m[1])],
        ["GET", /^\/notificationsforrepresentatives$/, (m, q) => db.vvns.filter((v) => !q.get("organizationId") || lower(v.shippingAgentOrganizationId) === lower(q.get("organizationId")))],

        ["GET", /^\/vesselvisitexecution\/getall$/, () => db.vves],
        ["GET", /^\/vesselvisitexecution\/search$/, (m, q) => search(db.vves, q)],
        ["GET", /^\/vesselvisitexecution\/([^/]+)\/planned-operations$/, (m) => {
            const vve = byId(db.vves, m[1]);
            const plan = db.operationPlans[0];
            return vve && plan ? (plan.items || []).filter((i) => i.vesselVisitId === vve.vesselVisitId) : [];
        }],
        ["GET", /^\/vesselvisitexecution\/([^/]+)$/, (m) => byId(db.vves, m[1])],

        ["GET", /^\/operationplan\/getall$/, () => db.operationPlans],
        ["GET", /^\/operationplan\/search$/, (m, q) => search(db.operationPlans, q)],
        ["GET", /^\/operationplan\/getbyid\/([^/]+)$/, (m) => byId(db.operationPlans, m[1])],
        ["GET", /^\/operationplan\/missing-plans\/[^/]+$/, () => []],
        ["GET", /^\/operationplan\/resource-utilization$/, () => [
            { resourceName: "STS Crane #1", totalAllocatedMinutes: 420, totalOperations: 3 },
            { resourceName: "Yard Crane #2", totalAllocatedMinutes: 260, totalOperations: 2 },
        ]],

        ["GET", /^\/incidents\/types\/all$/, () => db.incidentTypes],
        ["GET", /^\/incidents\/types\/([^/]+)$/, (m) => byId(db.incidentTypes, m[1], "id", "_id")],
        ["GET", /^\/incidents\/search$/, (m, q) => search(db.incidents, q)],
        ["GET", /^\/incidents\/([^/]+)$/, (m) => byId(db.incidents, m[1], "id", "_id")],

        ["GET", /^\/complementarytasks\/categories\/all$/, () => db.taskCategories],
        ["GET", /^\/complementarytasks\/categories\/([^/]+)$/, (m) => byId(db.taskCategories, m[1], "id", "_id")],
        ["GET", /^\/complementarytasks\/search$/, (m, q) => search(db.tasks, q)],
        ["GET", /^\/complementarytasks\/([^/]+)$/, (m) => byId(db.tasks, m[1], "id", "_id")],

        ["GET", /^\/privacy\/latest$/, () => db.privacyLatest],
        ["GET", /^\/privacy\/history$/, () => db.privacyHistory],
        ["GET", /^\/user-profiles\/privacy-status$/, () => ({
            userId: "demo", name: user.name, roles: user.roles, mustAcceptPrivacy: false,
            currentPolicyVersion: db.privacyLatest && db.privacyLatest.version,
        })],
        ["GET", /^\/user-profiles\/me\/export$/, () => ({ profile: user, exportedAt: new Date().toISOString(), note: "Demo data" })],

        ["POST", /^\/scheduling\/daily$/, (m, q, body) => buildSchedule((body && body.heuristic) || "Earliest Arrival", 1)],
        ["POST", /^\/scheduling\/daily-with-multi-crane$/, (m, q, body) => {
            const single = buildSchedule((body && body.heuristic) || "Earliest Arrival", 1);
            const multi = buildSchedule((body && body.heuristic) || "Earliest Arrival", 2);
            return {
                singleCrane: single, multiCrane: multi, craneHoursSingle: 7.5, craneHoursMulti: 8.2,
                multiCraneUsed: multi.totalDelayMinutes < single.totalDelayMinutes,
                delayImprovementMinutes: single.totalDelayMinutes - multi.totalDelayMinutes,
            };
        }],
        ["POST", /^\/scheduling\/rebalance$/, () => ({
            assignments: db.vvns.filter((v) => v.status === "Approved").map((v, i) => ({ vesselVisitId: v.id, dockId: db.docks[i % db.docks.length].id })),
            totalDelayMinutes: 0,
        })],
    ];

    // ---- Notice shown when a change is "saved" ----
    const isPt = () => { try { return localStorage.getItem("preferred-language") === "pt"; } catch { return false; } };
    let toastTimer = null;
    const notifyNotSaved = () => {
        let el = document.getElementById("demo-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "demo-toast";
            el.style.cssText = "position:fixed;bottom:64px;left:16px;z-index:10000;max-width:320px;padding:10px 14px;border-radius:8px;background:#f59e0b;color:#111;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3)";
            document.body.appendChild(el);
        }
        el.textContent = isPt() ? "Modo demonstração: as alterações não são guardadas." : "Demo mode: changes are not saved.";
        el.style.display = "block";
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.style.display = "none"; }, 3500);
    };

    // ---- Permanent banner ----
    document.addEventListener("DOMContentLoaded", () => {
        const banner = document.createElement("div");
        banner.id = "demo-banner";
        banner.style.cssText = "position:fixed;bottom:16px;left:16px;z-index:10000;padding:8px 14px;border-radius:999px;background:rgba(15,23,42,.92);color:#e2e8f0;border:1px solid #38bdf8;font:600 12px/1.3 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3)";
        banner.innerHTML = (isPt()
            ? "🧪 Demonstração com dados de exemplo · "
            : "🧪 Demo with sample data · ") +
            '<a href="https://github.com/igor-coutinho22/Port_Management_System" target="_blank" rel="noopener" style="color:#38bdf8">' +
            (isPt() ? "Ver código" : "View source") + "</a>";
        document.body.appendChild(banner);
    });

    // ---- fetch interceptor ----
    const apiBases = [window.APP_CONFIG.webAppApiUrl, window.APP_CONFIG.oemApiUrl].map((b) => lower(b).replace(/\/+$/, ""));
    const realFetch = window.fetch.bind(window);
    const json = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), {
        status, headers: { "Content-Type": "application/json" },
    });

    window.fetch = async (input, init = {}) => {
        const url = typeof input === "string" ? input : input.url;
        if (!apiBases.some((b) => lower(url).startsWith(b))) return realFetch(input, init);

        const parsed = new URL(url);
        const path = lower(parsed.pathname).replace(/^\/api/, "").replace(/\/+$/, "") || "/";
        const method = (init.method || (typeof input === "object" && input.method) || "GET").toUpperCase();
        let body = null;
        try { body = init.body ? JSON.parse(init.body) : null; } catch { body = init.body; }

        await new Promise((r) => setTimeout(r, 120)); // feel like a network call

        for (const [m, re, handler] of routes) {
            const match = m === method && re.exec(path);
            if (match) {
                const result = handler(match, parsed.searchParams, body);
                return result === undefined || result === null ? json(404, { message: "Not found (demo data)" }) : json(200, result);
            }
        }

        if (method === "GET") return json(200, []);

        // Create / update / delete: accept the request but do not persist it
        notifyNotSaved();
        if (method === "DELETE") return new Response(null, { status: 204 });
        const echo = Object.assign({ id: "demo-" + Date.now() }, body && typeof body === "object" ? body : {});
        return json(method === "POST" ? 201 : 200, echo);
    };
})();
