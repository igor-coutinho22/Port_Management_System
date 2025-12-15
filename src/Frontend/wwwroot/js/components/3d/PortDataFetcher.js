class PortDataFetcher {

    constructor() {
        this.apiBaseUrl = "https://localhost:5001";
    }

    api(path) {
        // ensures no double slashes
        return `${this.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    }

    async loadAll() {
        const errors = [];

        const safeFetch = async (name, fn, fallback) => {
            try { return await fn(); }
            catch (err) {
                console.error(`PortDataFetcher: Failed to load ${name}:`, err);
                errors.push(`${name}: ${err.message}`);
                return fallback;
            }
        };

        const textureConfig = await safeFetch("textureConfig", () => this.fetchTextureConfig(), null);
        const modelConfig = await safeFetch("modelConfig", () => this.fetchModelConfig(), null);
        const docks = await safeFetch("docks", () => this.fetchDocks(), null);
        const storageAreas = await safeFetch("storageAreas", () => this.fetchStorageAreas(), null);
        const resources = await safeFetch("resources", () => this.fetchResources(), null);

        // Fetch approved visits to filter vessels
        const approvedVisits = await safeFetch("approvedVisits", () => this.fetchApprovedVisits(), null);

        // Fetch all vessels but filter them
        const allVessels = await safeFetch("vessels", () => this.fetchVessels(), null);

        // Filter and enrich vessels
        const vessels = allVessels.filter(v => {
            // Handle potential casing differences (vesselIMO vs VesselIMO)
            const visit = approvedVisits.find(visit => {
                const visitImo = (visit.vesselIMO || visit.VesselIMO || "").toString().trim().toLowerCase();
                const vesselId = (v.id || "").toString().trim().toLowerCase();

                // Check if status is Approved
                const status = (visit.status || visit.Status || "").toString();
                const isApproved = status.toLowerCase() === "approved";

                return visitImo === vesselId && isApproved;
            });

            if (visit) {
                v.dockId = visit.dockId || visit.DockId; // Attach assigned dock ID
                return true;
            }
            return false;
        });

        console.log(`[PortDataFetcher] Matched ${vessels.length} vessels from ${allVessels.length} total vessels and ${approvedVisits.length} visits.`);

        const containers = this.extractContainers(storageAreas, vessels);

        const staff = await safeFetch("staff", () => this.fetchStaff(), null);

        return {
            textureConfig,
            modelConfig,
            docks,
            storageAreas,
            resources,
            vessels,
            staff,
            containers,
            errors
        };
    }

    async fetchTextureConfig() {
        const resp = await fetch("data/textures.json?v=2");
        if (!resp.ok) throw new Error("Failed to fetch texture config");
        return await resp.json();
    }

    async fetchModelConfig() {
        const resp = await fetch("data/models.json");
        if (!resp.ok) throw new Error("Failed to fetch model config");
        return await resp.json();
    }



    async fetchApprovedVisits() {
        // Fetch visits with status 'Approved' (Enum value 2 or string "Approved")
        // And filter by TODAY's date to show currently relevant vessels
        const now = new Date();
        // Widen the search window to +/- 30 days to ensure we see vessels even if the DB has old seed data
        // or if there are timezone discrepancies.
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        const end = new Date(now);
        end.setDate(end.getDate() + 30);

        const startOfDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0)).toISOString();
        const endOfDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59)).toISOString();

        // We fetch ALL visits in the date range to debug why they might not be showing up
        // We will filter for "Approved" (and maybe others) client-side
        const params = new URLSearchParams({
            // status: "Approved", // Commented out to fetch all statuses for debugging
            fromDate: startOfDay,
            toDate: endOfDay
        });

        console.log(`[PortDataFetcher] Fetching visits from ${startOfDay} to ${endOfDay}`);

        const resp = await fetch(this.api(`/api/vesselvisitnotification/search?${params.toString()}`), { credentials: 'include' });

        if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            console.warn("[PortDataFetcher] Visits search failed:", resp.status, text);
            return [];
        }

        const visits = await resp.json();
        console.log(`[PortDataFetcher] Fetched ${visits.length} visits:`, visits);
        return visits;
    }

    // -------------------------------------------------------------------------
    // DOCKS
    // -------------------------------------------------------------------------
    async fetchDocks() {
        const resp = await fetch(this.api("/api/docks"), { credentials: 'include' });
        if (!resp.ok) throw new Error("Failed to fetch docks");

        const docks = await resp.json();

        // Normalize dock DTOs
        return docks.map(d => ({
            id: d.id,
            name: d.name,
            location: d.location,
            lengthMeters: d.lengthMeters || 200,
            depthMeters: d.depthMeters || 10,
            maxDraftMeters: d.maxDraftMeters || 12
        }));
    }

    // -------------------------------------------------------------------------
    // STORAGE AREAS (Warehouses + Container Yards)
    // -------------------------------------------------------------------------
    async fetchStorageAreas() {
        const resp = await fetch(this.api("/api/storageAreas"), { credentials: "include" });
        if (!resp.ok) throw new Error("Failed to fetch storage areas");

        const rawList = await resp.json();

        return rawList.map(sa => {
            const common = sa.storageArea || sa.StorageArea || sa;

            // IMPORTANT: container list might be on sa or on common depending on your DTO
            const containerList = sa.containerList || sa.ContainerList || common.containerList || common.ContainerList || [];

            const base = {
                id: common.id || common.Id,
                name: common.name || common.Name,
                type: common.type || common.Type || common.storageAreaType,
                maxCapacityTeu: common.maxCapacityTeu || common.MaxCapacityTeu,
                currentOccupancyTeu: common.currentOccupancyTeu || common.CurrentOccupancyTeu || 0,

                // normalize container DTOs (Identifier/Teu)
                containers: (containerList || []).map(c => ({
                    id: c.identifier || c.Identifier,
                    teu: c.teu || c.Teu
                }))
            };

            if (sa.specializedCargoType || sa.SpecializedCargoType) {
                return {
                    ...base,
                    subtype: "Warehouse",
                    specializedCargoType: sa.specializedCargoType || sa.SpecializedCargoType,
                    containers: [] // don't render inside warehouses
                };
            }

            if (sa.dockIds || sa.DockIds || (common.dockConnections && common.dockConnections.length > 0)) {
                return {
                    ...base,
                    subtype: "ContainerYard",
                    dockIds: sa.dockIds || sa.DockIds || [],
                    dockConnections: common.dockConnections || common.DockConnections || []
                };
            }

            return { ...base, subtype: "Unknown", containers: [] };
        });
    }


    // -------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, tractors, etc.)
    // -------------------------------------------------------------------------
    async fetchResources() {
        const resp = await fetch(this.api("/api/resources"), { credentials: 'include' });
        if (!resp.ok) throw new Error("Failed to fetch resources");

        const list = await resp.json();

        return list.map(r => ({
            id: r.id,
            description: r.description,
            resourceType: r.resourceType,
            operationalCapacity: r.operationalCapacity,
            status: r.status || "unknown"
        }));
    }

    // -------------------------------------------------------------------------
    // VESSELS
    // -------------------------------------------------------------------------
    async fetchVessels() {
        const resp = await fetch(this.api("/api/vessels"), { credentials: "include" });
        if (!resp.ok) throw new Error("Failed to fetch vessels");

        const list = await resp.json();

        return list.map(v => ({
            id: v.imo,
            name: v.vesselName,
            type: v.vesselTypeName,
            length: 150,
            width: (v.rows || 10) * 3,
            height: (v.tiers || 5) * 3,
            operator: v.operatorName,
            cargoGrid: v.cargoGrid || v.CargoGrid || null
        }));
    }


    // -------------------------------------------------------------------------
    // STAFF
    // -------------------------------------------------------------------------
    async fetchStaff() {
        const resp = await fetch(this.api("/api/staff"), { credentials: 'include' });
        if (!resp.ok) throw new Error("Failed to fetch staff");

        const list = await resp.json();

        return list.map(s => ({
            id: s.mecanographicNumber,
            name: s.shortName,
            status: s.status,
            email: s.email
        }));
    }

    extractContainers(storageAreas, vessels) {
        const out = [];

        // --- from yards ---
        for (const sa of storageAreas || []) {
            if (sa.subtype !== "ContainerYard") continue;

            const list = sa.containerList || sa.ContainerList || sa.containers || [];
            for (const c of list) {
                out.push({
                    id: c.identifier || c.Identifier || c.id || c.Id,
                    teu: c.teu || c.Teu || 1,
                    locationType: "yard",
                    yardId: sa.id
                });
            }
        }

        // --- from vessels ---
        for (const v of vessels || []) {
            const grid = v.cargoGrid || v.CargoGrid;
            const flat = grid?.grid || grid?.Grid || [];
            for (let i = 0; i < flat.length; i++) {
                const c = flat[i];
                if (!c) continue;
                out.push({
                    id: c.identifier || c.Identifier,
                    teu: c.teu || c.Teu || 1,
                    locationType: "vessel",
                    vesselId: v.id,
                    flatIndex: i
                });
            }
        }

        return out;
    }


}

// Expose globally
window.PortDataFetcher = PortDataFetcher;
