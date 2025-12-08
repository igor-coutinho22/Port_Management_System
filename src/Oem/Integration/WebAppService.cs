using System.Net;
using System.Text.Json;

namespace Oem.Integration
{
    // Implementation
    public class WebAppService : IWebAppService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WebAppService> _logger;

        public WebAppService(IHttpClientFactory httpClientFactory, ILogger<WebAppService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("DomainBackend");
            _logger = logger;
        }

        public async Task<bool> IsVesselValidAsync(string vesselImo)
        {
            // Requirement: Validate via REST API, no direct DB access
            try
            {
                // Calls WebApp: GET /api/vessels/getByIMO/{imo}
                var response = await _httpClient.GetAsync($"/api/vessels/getByIMO/{vesselImo}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Vessel IMO {Imo}", vesselImo);
                return false;
            }
        }

        public async Task<bool> IsDockValidAsync(Guid dockId)
        {
            try
            {
                // Calls WebApp: GET /api/docks/{id}
                var response = await _httpClient.GetAsync($"/api/docks/{dockId}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Dock ID {Id}", dockId);
                return false;
            }
        }
    }
}