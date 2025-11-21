class PortDataFetcher {

    async loadAll() {
        try {
            const [docks, storageAreas, resources] = await Promise.all([
                this.fetchDocks(),
                this.fetchStorageAreas(),
                this.fetchResources()
            ]);

            return {
                docks,
                storageAreas,
                resources
            };
        } catch (err) {
            console.error("PortDataFetcher.loadAll() failed:", err);
            throw new Error("Failed to load port data from server.");
        }
    }

    // -------------------------------------------------------------------------
    // DOCKS
    // -------------------------------------------------------------------------
    async fetchDocks() {
        const resp = await fetch("/api/docks");
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
        const resp = await fetch("/api/storageAreas");
        if (!resp.ok) throw new Error("Failed to fetch storage areas");

        const rawList = await resp.json();

        return rawList.map(sa => {
            const common = sa.storageArea || sa;

            const base = {
                id: common.id,
                name: common.name,
                type: common.type || common.storageAreaType,
                maxCapacityTeu: common.maxCapacityTeu,
                currentOccupancyTeu: common.currentOccupancyTeu || 0
            };

            // Detect subtype
            if (sa.specializedCargoType) {
                return {
                    ...base,
                    subtype: "Warehouse",
                    specializedCargoType: sa.specializedCargoType
                };
            }

            if (sa.dockIds || (common.dockConnections && common.dockConnections.length > 0)) {
                return {
                    ...base,
                    subtype: "ContainerYard",
                    dockIds: sa.dockIds || [],
                    dockConnections: common.dockConnections || []
                };
            }

            return { ...base, subtype: "Unknown" };
        });
    }

    // -------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, tractors, etc.)
    // -------------------------------------------------------------------------
    async fetchResources() {
        const resp = await fetch("/api/resources");
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
