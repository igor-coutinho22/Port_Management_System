using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IVesselTypeService
    {
        List<VesselType> GetAllVesselTypes();
        VesselType? GetVesselTypeByName(string name);
        List<VesselType> SearchVesselTypesByName(string partialName);
        List<VesselType> SearchVesselTypesByDescription(string keyword);
        void AddVesselType(string name, string description, int maxBays, int maxRows, int maxTiers);
        void UpdateVesselType(string currentName, string newName, string description, int maxBays, int maxRows, int maxTiers);
    }
}
