using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselTypeRepository
    {
        List<VesselType> GetAll();
        VesselType? GetByName(string name);
        List<VesselType> SearchByDescription(string keyword);
    }
}
