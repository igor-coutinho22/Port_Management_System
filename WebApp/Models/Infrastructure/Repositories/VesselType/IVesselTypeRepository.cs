using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselTypeRepository
    {
        Task<List<VesselType>> GetAllAsync();
        Task<VesselType?> GetByNameAsync(string name);
        Task<List<VesselType>> SearchByNameAsync(string partialName);
        Task<List<VesselType>> SearchByDescriptionAsync(string keyword);
        Task AddAsync(VesselType vesselType);
        Task UpdateAsync(string currentName, VesselType updatedVesselType);
    }
}
