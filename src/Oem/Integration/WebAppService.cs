using System.Net.Http.Headers;
using System.Text.Json;
using Oem.Models.Application.DTOs;

namespace Oem.Integration
{
    public class WebAppService : IWebAppService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WebAppService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public WebAppService(
            IHttpClientFactory httpClientFactory,
            ILogger<WebAppService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClientFactory.CreateClient("DomainBackend");
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        // -------------------- Helper --------------------
        private HttpRequestMessage CreateAuthorizedRequest(
            HttpMethod method,
            string relativeUrl)
        {
            var request = new HttpRequestMessage(method, relativeUrl);

            var token = _httpContextAccessor.HttpContext?
                .Request.Headers["Authorization"]
                .FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(token))
            {
                request.Headers.Authorization =
                    AuthenticationHeaderValue.Parse(token);
            }

            return request;
        }

        // -------------------- Methods --------------------

        public async Task<bool> IsVesselValidAsync(string vesselImo)
        {
            try
            {
                var request = CreateAuthorizedRequest(
                    HttpMethod.Get,
                    $"api/vessels/getByIMO/{vesselImo}"
                );

                var response = await _httpClient.SendAsync(request);
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
                var request = CreateAuthorizedRequest(
                    HttpMethod.Get,
                    $"api/docks/{dockId}"
                );

                var response = await _httpClient.SendAsync(request);
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
            try
            {
                var from = date.ToDateTime(TimeOnly.MinValue).ToString("O");
                var to = date.ToDateTime(TimeOnly.MaxValue).ToString("O");

                var url =
                    $"api/vesselvisitnotification/search" +
                    $"?status=Approved" +
                    $"&fromDate={Uri.EscapeDataString(from)}" +
                    $"&toDate={Uri.EscapeDataString(to)}";

                var request = CreateAuthorizedRequest(HttpMethod.Get, url);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "WebApp returned {StatusCode} for GetApprovedVisitsForDateAsync",
                        response.StatusCode
                    );
                    return new List<VesselVisitNotificationDTO>();
                }

                var content = await response.Content.ReadAsStringAsync();

                return JsonSerializer.Deserialize<List<VesselVisitNotificationDTO>>(
                           content,
                           new JsonSerializerOptions
                           {
                               PropertyNameCaseInsensitive = true
                           }
                       ) ?? new List<VesselVisitNotificationDTO>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching approved visits for {Date}", date);
                return new List<VesselVisitNotificationDTO>();
            }
        }
    }
}
