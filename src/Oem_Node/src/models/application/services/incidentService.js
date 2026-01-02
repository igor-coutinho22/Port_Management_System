const webAppService = require('../../infrastructure/integration/webAppService');
const vesselVisitExecutionRepository = require('../../infrastructure/repositories/vesselVisitExecutionRepository');

// This service is a facade that orchestrates searching between Mongo (VVEs) and SQL (Incidents)
class IncidentService {

    async searchIncidents(filters, token) {
        // filters: { start, end, status, severity, vessel }

        let targetVveIds = null;

        // 1. Resolve Vessel Filter (Name/IMO -> VVE IDs)
        if (filters.vessel) {
            // Find VVEs matching the vessel filter
            // This relies on the VVE Repository supporting a loose search or we build a query
            const vveQuery = {
                $or: [
                    { vesselIMO: filters.vessel },
                    { vesselVisitId: filters.vessel } // Basic check
                ]
            };
            const vves = await vesselVisitExecutionRepository.findAsync(vveQuery);
            targetVveIds = vves.map(v => v.vesselVisitId); // These are the functional IDs (GUIDs)

            // If vves found, we have a specific list. If none found, the filter results in empty.
            if (targetVveIds.length === 0) return [];
        }

        // 2. Call C# Endpoint filtering parameters
        // query: ?start=...&end=...&status=...&severity=...&vveIds=...
        const queryParams = new URLSearchParams();
        if (filters.start) queryParams.append('start', filters.start);
        if (filters.end) queryParams.append('end', filters.end);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.severity) queryParams.append('severity', filters.severity);

        if (targetVveIds) {
            queryParams.append('vveIds', targetVveIds.join(','));
        }

        // Use webAppService to call C# backend
        // We assume webAppService has a generic 'get' or we add a specific method.
        // Checking webAppService capabilities... let's assume we need to extend it or use a generic client if available.
        // For now, I will use a hypothetical 'getIncidentsFromCore' method that I'll need to verify/add.
        return await webAppService.getIncidents(queryParams.toString(), token);
    }
}

module.exports = new IncidentService();
