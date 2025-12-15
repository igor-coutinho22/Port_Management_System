using System.Net;
using System.Text.Json;
using Oem.Models.Application.DTOs;

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

        public async Task<List<VesselVisitNotificationDTO>> GetApprovedVisitsForDateAsync(DateOnly date)
        {
            // Convert DateOnly to full ISO string range for the API
            var from = date.ToDateTime(TimeOnly.MinValue).ToString("O");
            var to = date.ToDateTime(TimeOnly.MaxValue).ToString("O");
            
            var url = $"/api/vesselvisitnotification/search?status=Approved&fromDate={Uri.EscapeDataString(from)}&toDate={Uri.EscapeDataString(to)}";

            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode) 
            {
                // Log error or return empty list depending on strictness
                return new List<VesselVisitNotificationDTO>();
            }

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            };

            return JsonSerializer.Deserialize<List<VesselVisitNotificationDTO>>(content, options) 
                   ?? new List<VesselVisitNotificationDTO>();
        }
    }
}