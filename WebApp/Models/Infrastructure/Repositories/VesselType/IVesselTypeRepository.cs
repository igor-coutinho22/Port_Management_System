using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselTypeRepository
    {
        Task<List<VesselType>> GetAllVesselTypesAsync();
        Task<VesselType?> GetVesselTypeByNameAsync(string name);
        Task<List<VesselType>> SearchVesselTypeByNameAsync(string partialName);
        Task<List<VesselType>> SearchVesselTypeByDescriptionAsync(string keyword);
        Task AddVesselTypeAsync(VesselType vesselType);
        Task UpdateVesselTypeAsync(VesselType updatedVesselType);
    }
}
