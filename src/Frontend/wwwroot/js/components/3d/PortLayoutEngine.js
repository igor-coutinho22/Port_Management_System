// -----------------------------------------------------------------------------
// PortLayoutEngine.js
// Clean zoning + road gaps + non-overlapping placement
// SEA (-Z) -> DOCKS -> ROAD -> YARDS -> ROAD -> WAREHOUSES ( +Z )
// -----------------------------------------------------------------------------

class PortLayoutEngine {

    constructor() {
        this.scale = 1.0;

        this.waterLineZ = 0;

        // Docks sit slightly inland from water line (positive Z)
        this.dockFrontZ = 10;

        // GLOBAL LAND SHIFT (positive Z moves everything inland / away from ocean)
        // Safest way to move the whole port without breaking roads/intersections.
        this.landOffsetZ = 15;

        // Fine-tune offsets (positive Z pushes further inland)
        // Use these when you want to nudge specific groups without moving roads/docks.
        this.warehouseOffsetZ = 80;
        // Offsets ONLY container yards (ContainerYard storage areas)
        // Total yard Z shift = landOffsetZ (through dockZ/yardsZ) + containerOffsetZ
        this.containerOffsetZ = 70;

        // Optional: per-container nudge inside the yard (leave at 0 unless needed)
        this.containerItemOffsetZ = 0;

        // Road bands between zones
        this.roadDepth = 40;       // asphalt lane + sidewalk space
        this.sidewalkDepth = 8;   // for visual sidewalks
        this.zoneGap = 40;         // extra buffer between zones

        this.dockZ = this.dockFrontZ + this.landOffsetZ;

        this.yardsZ = this.dockZ + this.containerOffsetZ + 100 + this.roadDepth + this.zoneGap;

        this.warehousesZ = this.yardsZ + this.warehouseOffsetZ - this.containerOffsetZ + 200 + this.roadDepth + this.zoneGap;

        // --- X spacing ---
        this.dockSpacing = 80;     // space between docks for service roads
        this.yardSpacing = 100;    // space between yards
        this.warehouseSpacing = 140;

        // --- Sea placement ---
        this.seaMargin = 40;        // gap from dock edge into sea
        this.shipQueueGap = 220;    // distance between ships queued at same dock (along Z into sea)

        // --- “Road lanes” for staff/trucks ---
        this.roadLaneCount = 3;
        this.roadLaneSpacing = 12;  // spacing between lane centerlines
    }

    computeLayout({ docks, storageAreas, resources, vessels, staff, containers }) {
        const dockLayouts = this.layoutDocks(docks || []);
        const storageLayouts = this.layoutStorageAreas(storageAreas || [], dockLayouts);

        const vesselLayouts = this.layoutVessels(vessels || [], dockLayouts);

        const resourceLayouts = this.layoutResources(resources || [], storageLayouts, dockLayouts);
        const staffLayouts = this.layoutStaff(staff || [], dockLayouts, storageLayouts);

        const containerLayouts = this.layoutContainers(containers || [], storageLayouts);

        const { roads, intersections } = this.layoutRoads(dockLayouts, storageLayouts);

        return {
            docks: dockLayouts,
            storageAreas: storageLayouts,
            resources: resourceLayouts,
            vessels: vesselLayouts,
            staff: staffLayouts,
            containers: containerLayouts,
            roads,
            intersections
        };
    }

    // ---------------------------------------------------------------------------
    // DOCKS: line them up along X with big gaps for access roads
    // ---------------------------------------------------------------------------
    layoutDocks(docks) {
        const layouts = [];
        if (!docks.length) return layouts;

        let totalWidth = 0;
        docks.forEach(d => {
            totalWidth += (d.lengthMeters || 200) * this.scale + this.dockSpacing;
        });
        totalWidth -= this.dockSpacing;

        let currentX = -totalWidth / 2;

        docks.forEach(dock => {
            const length = (dock.lengthMeters || 200) * this.scale;
            const depth = 60 * this.scale; // dock “thickness” inland
            const height = 10;

            layouts.push({
                id: dock.id,
                name: dock.name,
                type: "Dock",
                width: length,
                depth,
                height,
                x: currentX + length / 2,
                y: height / 2,
                z: this.dockZ
            });

            currentX += length + this.dockSpacing;
        });

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // STORAGE AREAS: yards row (closer) and warehouses row (behind)
    // ---------------------------------------------------------------------------
    layoutStorageAreas(storageAreas, dockLayouts) {
        const layouts = [];
        if (!storageAreas.length) return layouts;

        const yards = storageAreas.filter(s => s.subtype === "ContainerYard");
        const warehouses = storageAreas.filter(s => s.subtype === "Warehouse");
        const other = storageAreas.filter(s => s.subtype !== "ContainerYard" && s.subtype !== "Warehouse");

        const sizeFor = (sa) => {
            let base = 120;
            if (sa.maxCapacityTeu > 1000) base = 160;
            if (sa.maxCapacityTeu > 5000) base = 220;

            const isWarehouse = sa.subtype === "Warehouse";
            return {
                width: base * this.scale,
                depth: (isWarehouse ? base * 0.7 : base) * this.scale,
                height: isWarehouse ? 45 : 6
            };
        };

        const sortedYards = [...yards].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        const sortedWhs = [...warehouses].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        const yardDims = sortedYards.map(sizeFor);
        const whDims = sortedWhs.map(sizeFor);

        const maxCount = Math.max(sortedYards.length, sortedWhs.length);
        const maxCols = 4;
        const cols = Math.max(1, Math.min(maxCols, maxCount));

        const maxYardW = yardDims.reduce((m, d) => Math.max(m, d.width), 0);
        const maxWhW = whDims.reduce((m, d) => Math.max(m, d.width), 0);
        const maxItemW = Math.max(maxYardW, maxWhW, 120);

        const streetGap = 120; // shared road gap
        const cellWidth = maxItemW + streetGap;

        const docksSpan = this.getSpanX(dockLayouts);
        const centerX = (docksSpan.min + docksSpan.max) / 2;

        const colCenters = [];
        for (let c = 0; c < cols; c++) {
            const x = centerX + (c - (cols - 1) / 2) * cellWidth;
            colCenters.push(x);
        }

        const placeZone = (items, dims, startZ, rowStepZ) => {
            for (let i = 0; i < items.length; i++) {
                const sa = items[i];
                const dim = dims[i];

                const col = i % cols;
                const row = Math.floor(i / cols);

                layouts.push({
                    id: sa.id,
                    name: sa.name,
                    subtype: sa.subtype,
                    width: dim.width,
                    depth: dim.depth,
                    height: dim.height,
                    x: colCenters[col],
                    y: dim.height / 2,
                    z: startZ + row * rowStepZ
                });
            }
        };

        const maxYardD = yardDims.reduce((m, d) => Math.max(m, d.depth), 0);
        const maxWhD = whDims.reduce((m, d) => Math.max(m, d.depth), 0);

        const yardRowStepZ = maxYardD + 80;
        const whRowStepZ = maxWhD + 120;

        placeZone(sortedYards, yardDims, this.yardsZ, yardRowStepZ);
        placeZone(sortedWhs, whDims, this.warehousesZ, whRowStepZ);

        if (other.length) {
            const sortedOther = [...other].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            const otherDims = sortedOther.map(sizeFor);
            const maxOtherD = otherDims.reduce((m, d) => Math.max(m, d.depth), 0);
            const otherStep = maxOtherD + 100;

            // Keep "other" behind warehouses, following the warehouse offset for consistency.
            placeZone(sortedOther, otherDims, this.warehousesZ + whRowStepZ + 120, otherStep);
        }

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // VESSELS
    // ---------------------------------------------------------------------------
    layoutVessels(vessels, dockLayouts) {
        const layouts = [];
        if (!vessels.length) return layouts;

        const byDock = new Map();
        vessels.forEach(v => {
            const k = v.dockId || "NO_DOCK";
            if (!byDock.has(k)) byDock.set(k, []);
            byDock.get(k).push(v);
        });

        for (const [dockId, list] of byDock.entries()) {
            const ordered = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

            if (dockId !== "NO_DOCK") {
                const dock = dockLayouts.find(d => d.id === dockId);
                if (!dock) continue;

                ordered.forEach((v, idx) => {
                    const length = (v.length || 150) * this.scale;
                    const width = (v.width || 30) * this.scale;

                    const baseZ = dock.z - dock.depth / 2 - width / 2 - this.seaMargin;
                    const z = baseZ - idx * this.shipQueueGap;

                    layouts.push({
                        id: v.id,
                        name: v.name,
                        type: "Vessel",
                        vesselType: v.type,
                        dockId: dock.id,
                        length,
                        width,
                        height: (v.height || 20) * this.scale,
                        x: dock.x,
                        y: 0,
                        z,
                        rotation: 0
                    });
                });

            } else {
                ordered.forEach((v, i) => {
                    const length = (v.length || 150) * this.scale;
                    const width = (v.width || 30) * this.scale;

                    const col = i % 4;
                    const row = Math.floor(i / 4);

                    layouts.push({
                        id: v.id,
                        name: v.name,
                        type: "Vessel",
                        vesselType: v.type,
                        dockId: null,
                        length,
                        width,
                        height: (v.height || 20) * this.scale,
                        x: (col - 1.5) * 500,
                        y: 0,
                        z: -500 - row * 250,
                        rotation: 0
                    });
                });
            }
        }

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // RESOURCES
    // ---------------------------------------------------------------------------
    layoutResources(resources, storageLayouts, dockLayouts) {
        const layouts = [];
        if (!resources.length) return layouts;

        const isSTS = r => (r.resourceType === 0) || (String(r.resourceType).toLowerCase().includes("sts"));
        const isYard = r => (r.resourceType === 1) || (String(r.resourceType).toLowerCase().includes("yard"));
        const stsCranes = resources.filter(isSTS);
        const yardCranes = resources.filter(isYard);
        const others = resources.filter(r => !isSTS(r) && !isYard(r));

        const perDock = Math.max(1, Math.ceil(stsCranes.length / Math.max(1, dockLayouts.length)));
        let idx = 0;

        dockLayouts.forEach(dock => {
            const countHere = Math.min(perDock, stsCranes.length - idx);
            if (countHere <= 0) return;

            const step = dock.width / (countHere + 1);
            for (let i = 0; i < countHere; i++) {
                const res = stsCranes[idx++];
                const x = dock.x - dock.width / 2 + step * (i + 1);
                const z = dock.z - dock.depth / 2 + 8;
                layouts.push({
                    id: res.id,
                    name: res.description,
                    type: res.resourceType,
                    height: 55,
                    radius: 6,
                    x,
                    y: dock.height,
                    z
                });
            }
        });

        const yards = storageLayouts.filter(s => s.subtype === "ContainerYard");
        if (yards.length && yardCranes.length) {
            yardCranes.forEach((res, i) => {
                const yard = yards[i % yards.length];

                const cols = 3;
                const col = i % cols;
                const row = Math.floor(i / cols);

                const margin = 20;
                const usableW = Math.max(1, yard.width - margin * 2);
                const usableD = Math.max(1, yard.depth - margin * 2);

                const stepX = usableW / cols;
                const stepZ = usableD / 3;

                const x = yard.x - usableW / 2 + stepX * (col + 0.5);
                const z = yard.z - usableD / 2 + stepZ * ((row % 3) + 0.5);

                layouts.push({
                    id: res.id,
                    name: res.description,
                    type: res.resourceType,
                    height: 45,
                    radius: 6,
                    x,
                    y: yard.height,
                    z
                });
            });
        }

        const roadZ = (this.dockZ + this.yardsZ) / 2;
        const span = this.getSpanX(dockLayouts);

        others.forEach((res, i) => {
            const lane = i % this.roadLaneCount;
            const laneOffset = (lane - (this.roadLaneCount - 1) / 2) * this.roadLaneSpacing;

            const x = span.min + 80 + (i * 35) % Math.max(200, (span.max - span.min - 160));
            const z = roadZ + laneOffset;

            layouts.push({
                id: res.id,
                name: res.description,
                type: res.resourceType,
                height: 12,
                radius: 4,
                x,
                y: 3,
                z
            });
        });

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // STAFF
    // ---------------------------------------------------------------------------
    layoutStaff(staffList, dockLayouts, storageLayouts) {
        const layouts = [];
        if (!staffList.length) return layouts;

        const span = this.getSpanX(dockLayouts);
        const roadZ1 = (this.dockZ + this.yardsZ) / 2;
        const roadZ2 = (this.yardsZ + this.warehousesZ) / 2;

        staffList.forEach((s, i) => {
            const roadZ = (i % 2 === 0) ? roadZ1 : roadZ2;

            const lane = (i % 4);
            const laneOffset = (lane - 1.5) * 6;

            const x = span.min + 60 + (i * 18) % Math.max(180, (span.max - span.min - 120));
            const z = roadZ + laneOffset;

            layouts.push({
                id: s.id,
                name: s.name,
                type: "Staff",
                status: s.status,
                x,
                y: 6,
                z
            });
        });

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // CONTAINERS
    // ---------------------------------------------------------------------------
    layoutContainers(containers, storageLayouts) {
        const layouts = [];
        if (!containers.length) return layouts;

        const yards = storageLayouts.filter(s => s.subtype === "ContainerYard");
        if (!yards.length) return layouts;

        const byYard = new Map();
        containers.forEach(c => {
            const id = c.yardId || yards[0].id;
            if (!byYard.has(id)) byYard.set(id, []);
            byYard.get(id).push(c);
        });

        const containerW = 5;
        const containerD = 10;
        const containerH = 5;
        const gap = 2;

        for (const [yardId, list] of byYard.entries()) {
            const yard = yards.find(y => y.id === yardId) || yards[0];
            const margin = 15;

            const usableW = Math.max(1, yard.width - margin * 2);
            const usableD = Math.max(1, yard.depth - margin * 2);

            const cellW = containerW + gap;
            const cellD = containerD + gap;

            const cols = Math.max(1, Math.floor(usableW / cellW));
            const rows = Math.max(1, Math.floor(usableD / cellD));

            list.forEach((c, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols) % rows;
                const tier = Math.floor(i / (cols * rows));

                const x = yard.x - usableW / 2 + col * cellW + cellW / 2;
                // Yard already includes landOffsetZ and containerOffsetZ.
                // This offset is strictly a local nudge for containers inside the yard.
                const z = yard.z - usableD / 2 + row * cellD + cellD / 2 + this.containerItemOffsetZ;
                const y = yard.y + yard.height / 2 + containerH / 2 + tier * containerH;

                layouts.push({
                    id: c.id,
                    teu: c.teu,
                    yardId: yard.id,
                    x, y, z
                });
            });
        }

        return layouts;
    }

    // ---------------------------------------------------------------------------
    // NEW: ROADS & INTERSECTIONS LAYOUT
    // ---------------------------------------------------------------------------
    layoutRoads(dockLayouts, storageLayouts) {
        const roads = [];
        const intersections = [];

        if (!dockLayouts.length && !storageLayouts.length) {
            return { roads, intersections };
        }

        const bounds = this.getBounds(dockLayouts, storageLayouts);
        const marginX = 60;
        // Use a margin that respects configured zone gaps to avoid roads sitting too close
        const marginZ = Math.max(60, this.zoneGap);

        const minX = bounds.minX - marginX;
        const maxX = bounds.maxX + marginX;

        // Clamp the "north" bound so we never generate roads in the water/docks band.
        // Use dock back edge (dockMaxZ) as the start of land, then push it inland a bit.
        const docksSpanZ = this.getSpanZ(dockLayouts || []);
        const dockMaxZ = docksSpanZ.max;

        const unclampedMinZ = bounds.minZ - marginZ;
        const minLandZ = (dockLayouts.length ? (dockMaxZ + Math.max(10, this.zoneGap / 2)) : unclampedMinZ);
        const minZ = Math.max(unclampedMinZ, minLandZ);

        const maxZ = bounds.maxZ + marginZ;

        // Horizontal main roads between zones (dock<->yard, yard<->warehouse)
        const roadZ1 = (this.dockZ + this.yardsZ) / 2;
        const roadZ2 = (this.yardsZ + this.warehousesZ) / 2;

        // NEW: back road behind warehouses (acts like another row / service road)
        // Keep it tied to warehouse anchor + margins so it scales with layout.
        const roadZ3 = Math.max(
            this.warehousesZ + this.roadDepth + this.zoneGap + 40,
            maxZ - this.roadDepth
        );

        const totalWidth = maxX - minX;

        roads.push({
            id: "road_dock_yard",
            orientation: "horizontal",
            x: (minX + maxX) / 2,
            z: roadZ1,
            width: totalWidth,
            depth: this.roadDepth
        });

        roads.push({
            id: "road_yard_wh",
            orientation: "horizontal",
            x: (minX + maxX) / 2,
            z: roadZ2,
            width: totalWidth,
            depth: this.roadDepth
        });

        roads.push({
            id: "road_wh_back",
            orientation: "horizontal",
            x: (minX + maxX) / 2,
            z: roadZ3,
            width: totalWidth,
            depth: this.roadDepth
        });

        // Vertical roads: align with the storage grid/gaps so they match the building spacing.
        // Prefer using storage layouts; fall back to dock gap-based centers.
        const verticalXs = this.computeStorageGridRoadXs(storageLayouts, dockLayouts);
        // Vertical roads should span the main zone area but avoid extending into the sea/dock band.
        // Now that we have a back road after warehouses, extend verticals down to it.
        const vTop = roadZ1 - this.roadDepth; // above the dock<->yard road
        const vBottom = roadZ3 + this.roadDepth; // below the warehouse-back road
        const vDepth = Math.max((vBottom - vTop) * 1.1, 200);

        verticalXs.forEach((x, idx) => {
            roads.push({
                id: `vroad_${idx}`,
                orientation: "vertical",
                x,
                z: (vTop + vBottom) / 2,
                width: this.roadDepth,
                depth: vDepth
            });
        });

        // NOTE: Perimeter roads intentionally disabled.
        // They tend to wrap the docks (which are in/near water) and create unwanted visuals on the sea side.

        // Intersections: every vertical road crossing a horizontal road
        const horizRoads = roads.filter(r => r.orientation === "horizontal");
        const vertRoads = roads.filter(r => r.orientation === "vertical");

        horizRoads.forEach(hr => {
            vertRoads.forEach(vr => {
                intersections.push({
                    x: vr.x,
                    z: hr.z,
                    size: Math.min(this.roadDepth * 1, 80)
                });
            });
        });

        return { roads, intersections };
    }

    computeStorageGridRoadXs(storageLayouts, dockLayouts) {
        // If we have storage areas, try to align roads to the same logical columns.
        const storage = storageLayouts || [];
        const hasStorage = storage.length > 0;

        if (!hasStorage) {
            // Fallback: dock gaps
            return this.computeVerticalRoadXs(dockLayouts || []);
        }

        // Column centers are based on x positions present in layouts.
        // We cluster by rounding to a coarse grid to get distinct columns.
        const centers = storage
            .map(s => s.x)
            .filter(x => Number.isFinite(x))
            .map(x => Math.round(x / 10) * 10);

        const unique = Array.from(new Set(centers)).sort((a, b) => a - b);

        if (unique.length <= 1) {
            return this.computeVerticalRoadXs(dockLayouts || []);
        }

        // Roads go between columns -> midpoint between consecutive centers.
        const xs = [];
        for (let i = 0; i < unique.length - 1; i++) {
            const a = unique[i];
            const b = unique[i + 1];
            const gap = b - a;
            if (gap > Math.max(60, this.roadDepth)) {
                xs.push((a + b) / 2);
            }
        }

        // Also add a couple of roads at the sides of the grid (optional), but only if there's room.
        // This helps connect the outermost lanes without creating a full perimeter.
        const span = this.getSpanX(storage);
        const leftSide = span.min - Math.max(40, this.roadDepth);
        const rightSide = span.max + Math.max(40, this.roadDepth);
        if (Number.isFinite(leftSide)) xs.unshift(leftSide);
        if (Number.isFinite(rightSide)) xs.push(rightSide);

        return xs;
    }

    computeVerticalRoadXs(dockLayouts) {
        if (!dockLayouts || !dockLayouts.length) return [];

        // Build sorted intervals [left,right] for each dock
        const intervals = dockLayouts.map(d => {
            return { left: d.x - (d.width || 0) / 2, right: d.x + (d.width || 0) / 2 };
        }).sort((a, b) => a.left - b.left);

        // Merge overlapping intervals (defensive) and compute gaps between consecutive intervals
        const merged = [];
        for (const iv of intervals) {
            if (!merged.length) { merged.push({ ...iv }); continue; }
            const last = merged[merged.length - 1];
            if (iv.left <= last.right + 1e-6) {
                // overlap/adjacent -> extend right
                last.right = Math.max(last.right, iv.right);
            } else {
                merged.push({ ...iv });
            }
        }

        const xs = [];
        for (let i = 0; i < merged.length - 1; i++) {
            const cur = merged[i];
            const next = merged[i + 1];
            const gap = next.left - cur.right;
            // Only add a vertical road if there is a meaningful gap
            if (gap > Math.max(20, this.roadLaneSpacing * 2)) {
                xs.push((cur.right + next.left) / 2);
            }
        }

        return xs;
    }

    // ---------------------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------------------
    getSpanX(items) {
        if (!items || !items.length) return { min: -500, max: 500 };
        let min = Infinity, max = -Infinity;
        items.forEach(it => {
            const left = it.x - (it.width || 0) / 2;
            const right = it.x + (it.width || 0) / 2;
            min = Math.min(min, left);
            max = Math.max(max, right);
        });
        return { min, max };
    }

    getSpanZ(items) {
        if (!items || !items.length) return { min: -500, max: 500 };
        let min = Infinity, max = -Infinity;
        items.forEach(it => {
            const front = it.z - (it.depth || 0) / 2;
            const back = it.z + (it.depth || 0) / 2;
            min = Math.min(min, front);
            max = Math.max(max, back);
        });
        return { min, max };
    }

    getBounds(docks, storage) {
        const all = [...(docks || []), ...(storage || [])];
        if (!all.length) return { minX: -500, maxX: 500, minZ: -500, maxZ: 500 };

        const spanX = this.getSpanX(all);
        const spanZ = this.getSpanZ(all);

        return {
            minX: spanX.min,
            maxX: spanX.max,
            minZ: spanZ.min,
            maxZ: spanZ.max
        };
    }
}

window.PortLayoutEngine = PortLayoutEngine;
