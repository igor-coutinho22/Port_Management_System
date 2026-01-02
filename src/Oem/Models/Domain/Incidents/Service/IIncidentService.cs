using Oem.Models.Domain.Incidents;

namespace Oem.Models.Domain.Incidents.Service
{
    public interface IIncidentService
    {
        // Incident Types
        Task<IEnumerable<IncidentType>> GetAllIncidentTypesAsync();
        Task<IncidentType> GetIncidentTypeByIdAsync(Guid id);
        Task<IncidentType> CreateIncidentTypeAsync(IncidentType type);
        Task<IncidentType> UpdateIncidentTypeAsync(IncidentType type);
        Task DeleteIncidentTypeAsync(Guid id);

        // Incidents
        Task<IEnumerable<Incident>> GetAllIncidentsAsync();
        Task<Incident> GetIncidentByIdAsync(Guid id);
        Task<Incident> CreateIncidentAsync(Incident incident);
        Task<Incident> UpdateIncidentAsync(Incident incident);
        Task DeleteIncidentAsync(Guid id);
        
        Task<IEnumerable<Incident>> SearchIncidentsAsync(DateTime? start, DateTime? end, string? status, string? severity, string? vveIds);
    }
}
