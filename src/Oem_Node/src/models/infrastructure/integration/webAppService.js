const axios = require('axios');
const https = require('https'); // Import explicitly

class WebAppService {
    constructor() {
        // Create an agent that ignores SSL errors (Self-Signed Certs)
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });

        this.client = axios.create({
            baseURL: process.env.WEBAPP_API_URL || 'https://localhost:5001',
            timeout: 10000,
            httpsAgent: agent // Apply the agent here
        });
        
        console.log("--> [WebAppService] Initialized with SSL Bypass enabled.");
    }

    _getConfig(token) {
        if (!token) return {};
        return {
            headers: { Authorization: token }
        };
    }

    // Matches: Task<bool> IsVesselValidAsync(string vesselImo)
    async isVesselValid(vesselImo, token) {
        try {
            const response = await this.client.get(
                `/api/vessels/getByIMO/${vesselImo}`, 
                this._getConfig(token)
            );
            return response.status === 200;
        } catch (error) {
            console.error(`Error validating Vessel IMO ${vesselImo}:`, error.message);
            return false;
        }
    }

    // Matches: Task<bool> IsDockValidAsync(Guid dockId)
    async isDockValid(dockId, token) {
        try {
            const response = await this.client.get(
                `/api/docks/${dockId}`, 
                this._getConfig(token)
            );
            return response.status === 200;
        } catch (error) {
            console.error(`Error validating Dock ID ${dockId}:`, error.message);
            return false;
        }
    }

    // Matches: Task<VesselVisitNotificationDTO?> GetVesselVisitByIdAsync(Guid id)
    async getVesselVisitById(id, token) {
        try {
            const response = await this.client.get(
                `/api/vesselvisitnotification/${id}`, 
                this._getConfig(token)
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`Vessel Visit ${id} not found in WebApp module.`);
                return null;
            }
            console.error(`Error fetching vessel visit for ID ${id}:`, error.message);
            return null;
        }
    }

    // Matches: Task<List<VesselVisitNotificationDTO>> GetApprovedVisitsForDateAsync(DateOnly date)
    async getApprovedVisitsForDate(date, token) {
        try {
            // FIX: Manual ISO string construction to ensure correct day is sent
            let dateStr;
            if (date instanceof Date) {
                dateStr = date.toISOString().split('T')[0];
            } else {
                // Handle string input "2025-12-27"
                dateStr = date.toString().split('T')[0];
            }

            const from = `${dateStr}T00:00:00.000Z`;
            const to = `${dateStr}T23:59:59.999Z`;

            console.log(`[WebAppService] Fetching visits from ${from} to ${to}`);

            const response = await this.client.get('/api/vesselvisitnotification/search', {
                params: {
                    status: 'Approved',
                    fromDate: from,
                    toDate: to
                },
                ...this._getConfig(token)
            });

            return response.data || [];
        } catch (error) {
            console.error(`Error fetching approved visits: ${error.message}`);
            if(error.response) {
                // Log detailed error from C# if available
                console.error(`WebApp Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            return [];
        }
    }
}

module.exports = new WebAppService();