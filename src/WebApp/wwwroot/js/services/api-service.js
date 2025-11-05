// HTTP Client Service - Handles all API communications
class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Generic HTTP request method using Fetch API
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        // Add JSON body if data is provided
        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        try {
            console.log(`API Request: ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            // Handle different response types
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Return parsed JSON if response has content
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            throw error;
        }
    }

    // HTTP Methods
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

    // Specific API endpoints for Port Management
    
    // Resources API
    async getResources() {
        return this.get('/resources');
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

    // Vessels API
    async getVessels() {
        return this.get('/vessels');
    }

    async getVesselByImo(imo) {
        return this.get(`/vessels/getByIMO/${imo}`);
    }

    async createVessel(vesselData) {
        return this.post('/vessels', vesselData);
    }

    async updateVessel(imo, vesselData) {
        return this.put(`/vessels/${imo}`, vesselData);
    }

    async deleteVessel(imo) {
        return this.delete(`/vessels/${imo}`);
    }

    // Docks API
    async getDocks() {
        return this.get('/docks');
    }

    async getDockById(id) {
        return this.get(`/docks/${id}`);
    }

    // Storage Areas API
    async getStorageAreas() {
        return this.get('/storageAreas');
    }

    async getStorageAreaById(id) {
        return this.get(`/storageAreas/${id}`);
    }

    // Staff API
    async getStaff() {
        return this.get('/staff');
    }

    async getStaffById(id) {
        return this.get(`/staff/${id}`);
    }

    // Organizations API
    async getOrganizations() {
        return this.get('/organizations');
    }

    async getOrganizationById(id) {
        return this.get(`/organizations/${id}`);
    }

    // Vessel Types API
    async getVesselTypes() {
        return this.get('/vesselTypes');
    }

    async getVesselTypeById(id) {
        return this.get(`/vesselTypes/${id}`);
    }

    // Representatives API
    async getRepresentatives() {
        return this.get('/representatives');
    }

    async getRepresentativeById(id) {
        return this.get(`/representatives/${id}`);
    }

    // Qualifications API
    async getQualifications() {
        return this.get('/qualifications');
    }

    async getQualificationById(id) {
        return this.get(`/qualifications/${id}`);
    }

    // Vessel Visit Notifications API
    async getVesselVisitNotifications() {
        return this.get('/vesselVisitNotifications');
    }

    async getVesselVisitNotificationById(id) {
        return this.get(`/vesselVisitNotifications/${id}`);
    }
}

// Create global API service instance
const apiService = new ApiService();