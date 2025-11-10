using System.Collections.Generic;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Models.Application.Services
{
    public interface IVesselTypeService
    {
        Task<List<VesselType>> GetAllVesselTypesAsync();
        Task<VesselType?> GetVesselTypeByNameAsync(string name);
        Task<List<VesselType>> SearchVesselTypesByNameAsync(string partialName);
        Task<List<VesselType>> SearchVesselTypesByDescriptionAsync(string keyword);
        Task AddVesselTypeAsync(VesselType vesselType);
        Task UpdateVesselTypeAsync(VesselType vesselType);
        Task DeleteVesselTypeAsync(string name);
    }
}
