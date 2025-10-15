using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IVesselTypeService
    {
        List<VesselType> GetAllVesselTypes();
        VesselType? GetVesselTypeByName(string name);
        List<VesselType> SearchVesselTypes(string keyword);
    }
}
