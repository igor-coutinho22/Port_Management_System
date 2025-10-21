using System.Collections.Generic;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselRepository
    {
        Task AddVesselAsync(Vessel vessel);
        Task UpdateVesselAsync(Vessel vessel, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength);
        Task<Vessel?> GetByIMOAsync(string imo);
        Task<List<Vessel>> GetByNameAsync(string name);
        Task<List<Vessel>> GetByOperatorAsync(string operatorName);
        Task<List<Vessel>> GetAllAsync();
    }
}
