using Microsoft.EntityFrameworkCore;
using Oem.Models.Context;
using Oem.Models.Domain.Incidents;
using Oem.Models.Domain.Incidents.Service;

namespace Oem.Models.Application.Services.Incidents
{
    public class IncidentService : IIncidentService
    {
        private readonly OemContext _context;

        public IncidentService(OemContext context)
        {
            _context = context;
        }

        // --- Incident Types ---
        public async Task<IEnumerable<IncidentType>> GetAllIncidentTypesAsync()
        {
            return await _context.IncidentTypes.ToListAsync();
        }

        public async Task<IncidentType> GetIncidentTypeByIdAsync(Guid id)
        {
            return await _context.IncidentTypes.FindAsync(id);
        }

        public async Task<IncidentType> CreateIncidentTypeAsync(IncidentType type)
        {
            if (type == null) throw new ArgumentNullException(nameof(type));
            _context.IncidentTypes.Add(type);
            await _context.SaveChangesAsync();
            return type;
        }

        public async Task<IncidentType> UpdateIncidentTypeAsync(IncidentType type)
        {
            if (type == null) throw new ArgumentNullException(nameof(type));
            // In EF Core, if it's already tracked (e.g. from GetById), SaveChanges handles it.
            // If passed disconnected, we might need Update.
            // For safety in this pattern:
            _context.IncidentTypes.Update(type);
            await _context.SaveChangesAsync();
            return type;
        }

        public async Task DeleteIncidentTypeAsync(Guid id)
        {
            var entity = await _context.IncidentTypes.FindAsync(id);
            if (entity != null)
            {
                _context.IncidentTypes.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        // --- Incidents ---
        public async Task<IEnumerable<Incident>> GetAllIncidentsAsync()
        {
            return await _context.Incidents.ToListAsync();
        }

        public async Task<Incident> GetIncidentByIdAsync(Guid id)
        {
            return await _context.Incidents.FindAsync(id);
        }

        public async Task<Incident> CreateIncidentAsync(Incident incident)
        {
            if (incident == null) throw new ArgumentNullException(nameof(incident));
            _context.Incidents.Add(incident);
            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task<Incident> UpdateIncidentAsync(Incident incident)
        {
            if (incident == null) throw new ArgumentNullException(nameof(incident));
            _context.Incidents.Update(incident);
            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task DeleteIncidentAsync(Guid id)
        {
            var entity = await _context.Incidents.FindAsync(id);
            if (entity != null)
            {
                _context.Incidents.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Incident>> SearchIncidentsAsync(
            DateTime? start, 
            DateTime? end, 
            string? status, 
            string? severity, 
            string? vveIds)
        {
            var query = _context.Incidents.AsQueryable();

            if (start.HasValue)
                query = query.Where(i => i.StartTime >= start.Value);
            
            if (end.HasValue)
                query = query.Where(i => (i.EndTime.HasValue && i.EndTime.Value <= end.Value) || (i.StartTime <= end.Value)); 

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<IncidentStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(i => i.Status == statusEnum);
                }
            }

            if (!string.IsNullOrWhiteSpace(severity))
            {
                query = query.Where(i => i.Severity == severity);
            }

            // Execute Query to get candidate list
            var items = await query.ToListAsync();

            // In-Memory filtering for the VVE IDs (due to complex List<Guid> storage mapping)
            if (!string.IsNullOrWhiteSpace(vveIds))
            {
                var targetIds = vveIds.Split(',').Select(s => Guid.Parse(s)).ToHashSet();
                items = items.Where(i => 
                    i.Scope == IncidentScope.Global || 
                    (i.AffectedVesselVisitIds != null && i.AffectedVesselVisitIds.Any(id => targetIds.Contains(id)))
                ).ToList();
            }

            return items;
        }
    }
}
