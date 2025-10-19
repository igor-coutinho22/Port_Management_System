using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselTypeRepository
    {
        List<VesselType> GetAll();
        VesselType? GetByName(string name);
        List<VesselType> SearchByName(string partialName);
        List<VesselType> SearchByDescription(string keyword);
        void Add(VesselType vesselType);
        void Update(string currentName, VesselType updatedVesselType);
    }
}
