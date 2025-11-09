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
        
        // Debug headers issue
        console.log('🔍 Default headers:', this.defaultHeaders);
        console.log('🔍 Options headers:', options.headers);
        
        const config = {
            headers: { ...this.defaultHeaders, ...(options.headers || {}) },
            ...options
        };

        // Add JSON body if data is provided
        if (options.data) {
            config.body = JSON.stringify(options.data);
            // Ensure Content-Type is set for JSON data
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        }

        try {
            console.log(`API Request: ${config.method || 'GET'} ${url}`);
            console.log('🔍 Request config:', config);
            console.log('🔍 Request headers:', config.headers);
            console.log('🔍 Request body:', config.body);
            
            const response = await fetch(url, config);
            
            // Handle different response types
            if (!response.ok) {
                // Try to get detailed error message from response body
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        // Handle different error response formats
                        errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
                    } else {
                        // Handle plain text error responses
                        const errorText = await response.text();
                        if (errorText && errorText.trim()) {
                            errorMessage = errorText;
                        }
                    }
                } catch (parseError) {
                    // If we can't parse the error response, use the original message
                    console.warn('Could not parse error response:', parseError);
                }
                
                throw new Error(errorMessage);
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

    // Vessels API
    async getVessels() {
        return this.get('/vessels');
    }

    async getVesselByImo(imo) {
        return this.get(`/vessels/getByIMO/${imo}`);
    }

    async createVessel(vesselData) {
        // Extract vesselTypeName from the data to send as query parameter
        const { vesselTypeName, ...bodyData } = vesselData;
        
        // Build the URL with query parameter
        const params = new URLSearchParams();
        if (vesselTypeName) {
            params.append('vesselTypeName', vesselTypeName);
        }
        
        const endpoint = `/vessels?${params.toString()}`;
        return this.post(endpoint, bodyData);
    }

    async updateVessel(imo, vesselData) {
        // Extract vesselTypeName from the data to send as query parameter
        const { vesselTypeName, ...bodyData } = vesselData;
        
        // Build the URL with query parameter
        const params = new URLSearchParams();
        if (vesselTypeName) {
            params.append('vesselTypeName', vesselTypeName);
        }
        
        const endpoint = `/vessels/${imo}?${params.toString()}`;
        return this.put(endpoint, bodyData);
    }

    async deleteVessel(imo) {
        return this.delete(`/vessels/${imo}`);
    }

    async searchVessels(name = null, operatorName = null) {
        const params = new URLSearchParams();
        
        if (name && name.trim()) {
            params.append('name', name.trim());
        }
        
        if (operatorName && operatorName.trim()) {
            params.append('operatorName', operatorName.trim());
        }
        
        const queryString = params.toString();
        return this.get(`/vessels/searchByNameAndOperator${queryString ? '?' + queryString : ''}`);
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

    async getVesselTypeByName(name) {
        return this.get(`/vesselTypes/GetByName/${name}`);
    }

    async createVesselType(vesselTypeData) {
        return this.post('/vesselTypes', vesselTypeData);
    }

    async updateVesselType(currentName, vesselTypeData) {
        return this.put(`/vesselTypes/${currentName}`, vesselTypeData);
    }

    async deleteVesselType(name) {
        return this.delete(`/vesselTypes/${name}`);
    }

    async searchVesselTypes(name = null, description = null) {
        const params = new URLSearchParams();
        
        if (name && name.trim()) {
            params.append('name', name.trim());
        }
        
        if (description && description.trim()) {
            params.append('description', description.trim());
        }
        
        if (!params.toString()) {
            throw new Error('At least one search parameter (name or description) must be provided.');
        }
        
        return this.get(`/vesselTypes/search?${params.toString()}`);
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
        return this.get('/vesselvisitnotification');
    }

    async getVesselVisitNotificationById(id) {
        return this.get(`/vesselvisitnotification/${id}`);
    }
}

// Create global API service instance
const apiService = new ApiService();