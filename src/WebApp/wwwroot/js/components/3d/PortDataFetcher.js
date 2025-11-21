class PortDataFetcher {


    async loadAll() {
        const errors = [];

        const safeFetch = async (name, fn) => {
            try {
                return await fn();
            } catch (err) {
                console.error(`PortDataFetcher: Failed to load ${name}:`, err);
                errors.push(`${name}: ${err.message}`);
                return [];
            }
        };

        const docks = await safeFetch("docks", () => this.fetchDocks());
        const storageAreas = await safeFetch("storageAreas", () => this.fetchStorageAreas());
        const resources = await safeFetch("resources", () => this.fetchResources());

        return {
            docks,
            storageAreas,
            resources,
            errors
        };
    }

    // -------------------------------------------------------------------------
    // DOCKS
    // -------------------------------------------------------------------------
    async fetchDocks() {
        const resp = await fetch("/api/docks", { credentials: 'include' });
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
        const resp = await fetch("/api/storageAreas", { credentials: 'include' });
        if (!resp.ok) throw new Error("Failed to fetch storage areas");

        const rawList = await resp.json();

        return rawList.map(sa => {
            const common = sa.storageArea || sa.StorageArea || sa;

            const base = {
                id: common.id || common.Id,
                name: common.name || common.Name,
                type: common.type || common.Type || common.storageAreaType,
                maxCapacityTeu: common.maxCapacityTeu || common.MaxCapacityTeu,
                currentOccupancyTeu: common.currentOccupancyTeu || common.CurrentOccupancyTeu || 0
            };

            // Detect subtype
            if (sa.specializedCargoType || sa.SpecializedCargoType) {
                return {
                    ...base,
                    subtype: "Warehouse",
                    specializedCargoType: sa.specializedCargoType || sa.SpecializedCargoType
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

            return { ...base, subtype: "Unknown" };
        });
    }

    // -------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, tractors, etc.)
    // -------------------------------------------------------------------------
    async fetchResources() {
        const resp = await fetch("/api/resources", { credentials: 'include' });
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
}

// Expose globally
window.PortDataFetcher = PortDataFetcher;
