using System.Collections.Generic;
using WebApp.Models.Domain.Vessel.VesselType;
using WebApp.Models.Repositories;

namespace WebApp.Models.Application.Services.VesselTypeService
{
    public class VesselTypeService
    {
        private readonly VesselTypeRepository _vesselTypeRepo;

        public VesselTypeService(VesselTypeRepository vesselTypeRepo)
        {
            _vesselTypeRepo = vesselTypeRepo;
        }

        // Return all predefined vessel types
        public List<VesselType> GetAllVesselTypes() => _vesselTypeRepo.GetAll();

        // Search a vessel type by name
        public VesselType? GetVesselTypeByName(string name) => _vesselTypeRepo.GetByName(name);

        // Search vessel types by description keyword
        public List<VesselType> SearchVesselTypes(string keyword) =>
            _vesselTypeRepo.SearchByDescription(keyword);
    }
}
