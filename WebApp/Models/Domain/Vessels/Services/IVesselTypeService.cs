using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IVesselTypeService
    {
        Task<List<VesselType>> GetAllVesselTypesAsync();
        Task<VesselType?> GetVesselTypeByNameAsync(string name);
        Task<List<VesselType>> SearchVesselTypesByNameAsync(string partialName);
        Task<List<VesselType>> SearchVesselTypesByDescriptionAsync(string keyword);
        Task AddVesselTypeAsync(string name, string description, int maxBays, int maxRows, int maxTiers);
        Task UpdateVesselTypeAsync(string currentName, string newName, string description, int maxBays, int maxRows, int maxTiers);
    }
}
