// --- CONFIGURATION ---
const WEB_APP_API = "https://localhost:5001/api";  // Port 5001 (Vessels, Users, ...)
const OEM_API = "https://localhost:6001/api";      // Port 6001 (Scheduling, Plans)

class ApiService {
    async _getApiAccessToken() {
        try {
            const pca = window.__pca;
            if (!pca) {
                console.warn("MSAL PCA not initialized (window.__pca missing).");
                return null;
            }
            const accounts = pca.getAllAccounts();
            if (!accounts.length) return null;

            const req = { ...(window.apiRequest || {}), account: accounts[0] };
            const result = await pca.acquireTokenSilent(req);
            return result?.accessToken || null;
        } catch (e) {
            // Don’t redirect here inside the request pipeline; just log and continue without a token.
            console.warn("acquireTokenSilent for API failed (no Authorization header will be sent):", e);

            const code = e.errorCode || e.code || "";

            if (code.includes("interaction_required") || code.includes("login_required")) {
                pca.loginRedirect(window.apiRequest)
                console.warn("Token needs interaction. Consider redirecting to login.");
            }

            return null;
        }
    }

    // ---- Core request method (fetch) ----
    async request(endpoint, options = {}) {

        // --- ROUTING LOGIC: Choose the correct Backend ---
        let targetBaseUrl = this.baseUrl; // Default is WebApp (5001)

        // If asking for Sprint C features, switch to OEM (6001)
        if (endpoint.includes('/scheduling') ||
            endpoint.includes('/operationPlan') ||
            endpoint.includes('/incidents') ||
            endpoint.includes('/vesselVisitExecution')) {

            targetBaseUrl = OEM_API;
        }

        const url = `${targetBaseUrl}${endpoint}`;

        // ... The rest is standard ...
        const headers = { ...this.defaultHeaders, ...(options.headers || {}) };

        try {
            const token = await this._getApiAccessToken();
            if (token && !headers.Authorization) {
                headers.Authorization = `Bearer ${token}`;
            }
        } catch (_) { /* already logged */ }

        const config = { ...options, headers };

        if (options.data !== undefined) {
            config.body = JSON.stringify(options.data);
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        }

        // Debug log to help you see which port is being called
        console.log(`[API] ${config.method || 'GET'} ${url}`);

        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const ct = response.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const data = await response.json();
                    errorMessage = data.message || data.error || JSON.stringify(data) || errorMessage;
                } else {
                    const txt = await response.text();
                    if (txt && txt.trim()) errorMessage = txt;
                }
            } catch (parseErr) { }
            console.error(`API Error for ${url}:`, errorMessage);
            throw new Error(errorMessage);
        }

        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) return response.json();
        return response.text();
    }

    // ---- Convenience HTTP methods ----
    async get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    }
    async post(endpoint, data, headers = {}) {
        return this.request(endpoint, { method: 'POST', data, headers });
    }
    async put(endpoint, data, headers = {}) {
        return this.request(endpoint, { method: 'PUT', data, headers });
    }
    async delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }

    // ===== Specific API endpoints for Port Management =====

    // Resources
    async getResources(queryParams = '') {
        const url = queryParams ? `/resources?${queryParams}` : '/resources';
        return this.get(url);
    }
    async getResourceById(id) {
        return this.get(`/resources/${id}`);
    }
    async createResource(resourceData) {
        return this.post('/resources', resourceData);
    }
    async updateResource(id, resourceData) {
        return this.put(`/resources/${id}`, resourceData);
    }
    async deleteResource(id) {
        return this.delete(`/resources/${id}`);
    }

    // Resource status actions
    async activateResource(id) {
        return this.request(`/resources/${id}/activate`, { method: 'PATCH' });
    }
    async deactivateResource(id) {
        return this.request(`/resources/${id}/deactivate`, { method: 'PATCH' });
    }
    async startMaintenance(id) {
        return this.request(`/resources/${id}/maintenance/start`, { method: 'PATCH' });
    }
    async endMaintenance(id) {
        return this.request(`/resources/${id}/maintenance/end`, { method: 'PATCH' });
    }

    // Vessels
    async getVessels() {
        return this.get('/vessels');
    }
    async getVesselByImo(imo) {
        return this.get(`/vessels/getByIMO/${imo}`);
    }
    async createVessel(vesselData) {
        const { vesselTypeName, ...body } = vesselData;
        const params = new URLSearchParams();
        if (vesselTypeName) params.append('vesselTypeName', vesselTypeName);
        const endpoint = `/vessels?${params.toString()}`;
        return this.post(endpoint, body);
    }
    async updateVessel(imo, vesselData) {
        const { vesselTypeName, ...body } = vesselData;
        const params = new URLSearchParams();
        if (vesselTypeName) params.append('vesselTypeName', vesselTypeName);
        const endpoint = `/vessels/${imo}?${params.toString()}`;
        return this.put(endpoint, body);
    }
    async deleteVessel(imo) {
        return this.delete(`/vessels/${imo}`);
    }
    async searchVessels(name = null, operatorName = null) {
        const params = new URLSearchParams();
        if (name?.trim()) params.append('name', name.trim());
        if (operatorName?.trim()) params.append('operatorName', operatorName.trim());
        const qs = params.toString();
        return this.get(`/vessels/searchByNameAndOperator${qs ? `?${qs}` : ''}`);
    }

    // Docks
    async getDocks() {
        return this.get('/docks');
    }
    async getDockById(id) {
        return this.get(`/docks/${id}`);
    }
    async createDock(dockData) {
        return this.post('/docks', dockData);
    }
    async updateDock(id, dockData) {
        return this.put(`/docks/${id}`, dockData);
    }
    async deleteDock(id) {
        return this.delete(`/docks/${id}`);
    }
    async searchDocks(name = null, location = null, vesselTypeName = null) {
        const params = new URLSearchParams();
        if (name?.trim()) params.append('name', name.trim());
        if (location?.trim()) params.append('location', location.trim());
        if (vesselTypeName?.trim()) params.append('vesselTypeName', vesselTypeName.trim());
        return this.get(`/docks/search?${params.toString()}`);
    }

    // Storage Areas
    async getStorageAreas() {
        return this.get('/storageAreas');
    }
    async getStorageAreaById(id) {
        return this.get(`/storageAreas/GetById/${id}`);
    }
    async getStorageAreaByName(name) {
        return this.get(`/storageAreas/GetByName/${encodeURIComponent(name)}`);
    }
    async createContainerYard(data) {
        return this.post('/storageAreas/containerYard', data);
    }
    async createWarehouse(data) {
        return this.post('/storageAreas/warehouse', data);
    }
    async updateContainerYard(id, data) {
        return this.put(`/storageAreas/containerYard/${id}`, data);
    }
    async updateWarehouse(id, data) {
        return this.put(`/storageAreas/warehouse/${id}`, data);
    }
    async deleteStorageArea(id) {
        return this.delete(`/storageAreas/${id}`);
    }
    // Connections
    async addConnection(storageAreaId, data) {
        return this.post(`/storageAreas/${storageAreaId}/connections`, data);
    }
    async updateConnection(storageAreaId, dockId, data) {
        return this.put(`/storageAreas/${storageAreaId}/connections/${dockId}`, data);
    }
    async deleteConnection(storageAreaId, dockId) {
        return this.delete(`/storageAreas/${storageAreaId}/connections/${dockId}`);
    }
    async getConnection(storageAreaId, dockId) {
        return this.get(`/storageAreas/${storageAreaId}/connection/${dockId}`);
    }
    async getConnections(storageAreaId) {
        return this.get(`/storageAreas/${storageAreaId}/connections`);
    }

    // Staff
    async getStaff() {
        return this.get('/staff');
    }
    async getStaffById(id) {
        return this.get(`/staff/${id}`);
    }
    async createStaff(staffData) {
        return this.post('/staff', staffData);
    }
    async updateStaff(id, staffData) {
        return this.put(`/staff/${id}`, staffData);
    }
    async deleteStaff(id) {
        return this.delete(`/staff/${id}`);
    }
    async activateStaff(mecNumber) {
        return this.request(`/staff/${mecNumber}/activate`, { method: 'PATCH' });
    }
    async deactivateStaff(mecNumber) {
        return this.request(`/staff/${mecNumber}/deactivate`, { method: 'PATCH' });
    }
    // Send { code: qualificationCode } as QualificationDTO (name is optional, backend only needs code)
    async addQualificationToStaff(mecNumber, qualificationData) {
        // Accepts mecNumber and a full qualificationData object
        return this.post(`/staff/${mecNumber}/qualifications`, qualificationData);
    }
    async removeQualificationFromStaff(mecNumber, qualificationCode) {
        return this.delete(`/staff/${mecNumber}/qualifications/${encodeURIComponent(qualificationCode)}`);
    }

    async searchStaff(name = null, status = null, qualificationCode = null) {
        const params = new URLSearchParams();
        if (name?.trim()) params.append('name', name.trim());
        if (status?.trim()) params.append('status', status.trim());
        if (qualificationCode?.trim()) params.append('qualification', qualificationCode.trim());
        const qs = params.toString();
        return this.get(`/staff${qs ? `?${qs}` : ''}`);
    }

    // Organizations
    async getOrganizations() {
        return this.get('/organizations');
    }
    async getOrganizationById(id) {
        return this.get(`/organizations/${id}`);
    }
    async createOrganization(orgData) {
        return this.post('/organizations', orgData);
    }
    async updateOrganization(id, orgData) {
        return this.put(`/organizations/${id}`, orgData);
    }
    async deleteOrganization(id) {
        return this.delete(`/organizations/${id}`);
    }
    async addRepresentativeToOrganization(orgId, repData) {
        // POST /organizations/{id}/add
        return this.post(`/organizations/${orgId}/add`, repData);
    }
    async removeRepresentativeFromOrganization(orgId, repId) {
        // DELETE /organizations/{id}/remove with repId in body (as per backend)
        return this.request(`/organizations/${orgId}/remove`, {
            method: 'DELETE',
            data: repId,
        });
    }
    async activateOrganization(orgId) {
        return this.request(`/organizations/${orgId}/activate`, { method: 'PATCH' });
    }
    async deactivateOrganization(orgId) {
        return this.request(`/organizations/${orgId}/deactivate`, { method: 'PATCH' });
    }

    // Vessel Types
    async getVesselTypes() {
        return this.get('/vesselTypes');
    }
    async getVesselTypeByName(name) {
        return this.get(`/vesselTypes/GetByName/${encodeURIComponent(name)}`);
    }
    async createVesselType(vesselTypeData) {
        return this.post('/vesselTypes', vesselTypeData);
    }
    async updateVesselType(currentName, vesselTypeData) {
        return this.put(`/vesselTypes/${encodeURIComponent(currentName)}`, vesselTypeData);
    }
    async deleteVesselType(name) {
        return this.delete(`/vesselTypes/${encodeURIComponent(name)}`);
    }
    async searchVesselTypes(name = null, description = null) {
        const params = new URLSearchParams();
        if (name?.trim()) params.append('name', name.trim());
        if (description?.trim()) params.append('description', description.trim());
        if (!params.toString()) {
            throw new Error('At least one search parameter (name or description) must be provided.');
        }
        return this.get(`/vesselTypes/search?${params.toString()}`);
    }

    // Representatives
    async getRepresentatives() {
        return this.get('/representatives/all');
    }
    async getRepresentativeById(repId) {
        // The backend expects /representatives/{id}?repId=... so we must pass the id as both route and query param
        return this.get(`/representatives/${repId}?repId=${repId}`);
    }
    async getRepresentativesByOrganization(orgId) {
        return this.get(`/representatives?orgId=${orgId}`);
    }
    async createRepresentative(orgId, repData) {
        // POST /representatives?orgId=... with repData as body
        return this.post(`/representatives?orgId=${orgId}`, repData);
    }
    async updateRepresentative(repId, repData) {
        return this.put(`/representatives/${repId}`, repData);
    }
    async activateRepresentative(repId) {
        return this.request(`/representatives/${repId}/activate`, { method: 'PATCH' });
    }
    async deactivateRepresentative(repId) {
        return this.request(`/representatives/${repId}/deactivate`, { method: 'PATCH' });
    }

    // Qualifications
    async getQualifications() {
        return this.get('/qualifications');
    }
    async getQualificationByCode(code) {
        return this.get(`/qualifications/${encodeURIComponent(code)}`);
    }
    async registerQualification(qualificationData) {
        return this.post('/qualifications', qualificationData);
    }
    async updateQualification(code, qualificationData) {
        return this.put(`/qualifications/${encodeURIComponent(code)}`, qualificationData);
    }
    async deleteQualification(code) {
        return this.delete(`/qualifications/${encodeURIComponent(code)}`);
    }

    constructor() {
        // DEFAULT: Point to MasterData (Port 5000)
        // This fixes the "Unknown User" error because login/roles live here.
        this.baseUrl = WEB_APP_API;

        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Vessel Visit Notifications
    async getVesselVisitNotifications() {
        return this.get('/vesselvisitnotification');
    }

    async getVesselVisitNotificationsByOrganization(organizationId) {
        return this.get(`/notificationsForRepresentatives?organizationId=${organizationId}`);
    }

    async getVesselVisitNotificationById(id) {
        return this.get(`/vesselvisitnotification/${id}`);
    }

    async searchVesselVisitNotifications({ vesselIMO, status, fromDate, toDate, representative }) {
        const params = [];
        if (vesselIMO) params.push(`vesselIMO=${encodeURIComponent(vesselIMO)}`);
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (fromDate) params.push(`fromDate=${encodeURIComponent(fromDate)}`);
        if (toDate) params.push(`toDate=${encodeURIComponent(toDate)}`);
        if (representative) params.push(`representative=${encodeURIComponent(representative)}`);
        const query = params.length ? `?${params.join('&')}` : '';
        return this.get(`/vesselvisitnotification/search${query}`);
    }

    async createVesselVisitNotification(data) {
        return this.post('/vesselvisitnotification', data);
    }

    async editVesselVisitNotificationWhileInProgress(id, data) {
        return this.put(`/vesselvisitnotification/${id}/updateWhileInProgress`, data);
    }

    async submitVesselVisitNotification(id) {
        return this.put(`/notificationsForRepresentatives/${id}/submit`);
    }

    async approveVesselVisitNotification(id, dockId) {
        const query = dockId ? `?dockId=${encodeURIComponent(dockId)}` : '';
        return this.put(`/vesselvisitnotification/${id}/approve${query}`);
    }

    async rejectVesselVisitNotification(id, reasonObj) {
        // Reason is sent as JSON object: { reason: "..." }
        return this.put(`/vesselvisitnotification/${id}/reject`, reasonObj, { 'Content-Type': 'application/json' });
    }


    async addLoadingManifestToVesselVisitNotification(id, manifestDto) {
        return this.post(`/vesselvisitnotification/${id}/addLoadingManifest`, manifestDto);
    }

    async removeLoadingManifestFromVesselVisitNotification(id) {
        return this.delete(`/vesselvisitnotification/${id}/removeLoadingManifest`);
    }

    async addUnloadingManifestToVesselVisitNotification(id, manifestDto) {
        return this.put(`/vesselvisitnotification/${id}/addUnloadingManifest`, manifestDto);
    }

    async removeUnloadingManifestFromVesselVisitNotification(id) {
        return this.delete(`/vesselvisitnotification/${id}/removeUnloadingManifest`);
    }

    async addCrewMemberToVesselVisitNotification(id, crewMemberDto) {
        return this.post(`/vesselvisitnotification/${id}/addCrewMember`, crewMemberDto);
    }

    async removeCrewMemberFromVesselVisitNotification(id, citizenId) {
        return this.delete(`/vesselvisitnotification/${id}/removeCrewMember/${encodeURIComponent(citizenId)}`);
    }

    async deleteVesselVisitNotification(id) {
        return this.delete(`/vesselvisitnotification/${id}`);
    }

    // ME
    async getCurrentUser() {
        return this.get('/me');
    }

    // Scheduling
    async generateDailySchedule(targetDate, heuristic) {
        const body = { targetDate, heuristic };
        return this.post('/scheduling/daily', body);
    }

    async generateDailyScheduleWithMultiCrane(targetDate, heuristic) {
        const body = { targetDate, heuristic };
        return this.post('/scheduling/daily-with-multi-crane', body);
    }

    // Operation Plans

    async createOperationPlan(planData) {
        return this.post('/operationPlan', planData);
    }

    async getOperationPlans() {
        return this.get('/operationPlan/GetAll');
    }

    async searchOperationPlans(startDate, endDate, vesselIMO) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (vesselIMO) params.append('vesselIMO', vesselIMO);
        return this.get(`/operationPlan/Search?${params.toString()}`);
    }

    async getOperationPlanById(id) {
        return this.get(`/operationPlan/GetById/${id}`);
    }

    async deleteOperationPlan(id) {
        return this.delete(`/operationPlan/${id}`);
    }

    async updateOperationPlan(id, updateDto) {
        return this.put(`/operationPlan/${id}`, updateDto);
    }

    async approveOperationPlan(id) {
        return this.put(`/operationPlan/approve?id=${id}`);
    }

    async rejectOperationPlan(id) {
        return this.put(`/operationPlan/reject?id=${id}`);
    }

    async getMissingOperationPlans(date) {
        return this.get(`/operationPlan/missing-plans/${date}`);
    }

    async regenerateOperationPlan(date, heuristicName) {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (heuristicName) params.append('heuristicName', heuristicName);
        return this.post(`/operationPlan/regenerate?${params.toString()}`);
    }

    async getResourceUtilization(startDate, endDate, resourceType) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (resourceType) params.append('resourceType', resourceType);
        return this.get(`/operationPlan/resource-utilization?${params.toString()}`);
    }

    // Vessel Visit Executions
    async createVesselVisitExecution(executionData) {
        return this.post('/vesselVisitExecution/Create', executionData);
    }

    async getVesselVisitExecutionById(id) {
        return this.get(`/vesselVisitExecution/${id}`);
    }

    async getVesselVisitExecutions() {
        return this.get('/vesselVisitExecution/GetAll');
    }

    async updateVesselVisitExecution(id, updateData) {
        return this.put(`/vesselVisitExecution/${id}`, updateData);
    }

    async completeVesselVisitExecution(id, payload) {
        return this.post(`/vesselVisitExecution/${id}/Complete`, payload);
    }

    async getPlannedOperations(id) {
        return this.get(`/vesselVisitExecution/${id}/planned-operations`);
    }

    async searchVesselVisitExecutions(params) {
        const query = new URLSearchParams(params).toString();
        return this.get(`/vesselVisitExecution/Search?${query}`);
    }

    async deleteVesselVisitExecution(id) {
        return this.delete(`/vesselVisitExecution/${id}`);
    }

    // --- INCIDENT TYPES ---

    async getAllIncidentTypes() {
        return this.get('/incidents/types/all');
    }

    async getIncidentTypeById(id) {
        return this.get(`/incidents/types/${id}`);
    }

    async createIncidentType(data) {
        return this.post('/incidents/types', data);
    }

    async updateIncidentType(id, data) {
        return this.put(`/incidents/types/${id}`, data);
    }

    async deleteIncidentType(id) {
        return this.delete(`/incidents/types/${id}`);
    }

    // --- INCIDENTS ---

    async searchIncidents(filters) {
        // filters = { start, end, status, severity, vessel }
        const params = new URLSearchParams(filters).toString();
        return this.get(`/incidents/Search?${params}`);
    }

    async getIncidentById(id) {
        return this.get(`/incidents/${id}`);
    }

    async createIncident(data) {
        // data = { incidentTypeId, startTime, description, severity, scope, affectedVesselVisitIds }
        return this.post('/incidents', data);
    }

    async updateIncident(id, data) {
        // data = { status: 'Resolved', endTime: ..., etc }
        return this.put(`/incidents/${id}`, data);
    }

    async deleteIncident(id) {
        return this.delete(`/incidents/${id}`);
    }
}

const apiService = new ApiService();
window.apiService = apiService;