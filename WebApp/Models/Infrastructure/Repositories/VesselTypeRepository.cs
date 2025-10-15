using System.Collections.Generic;
using System.Linq;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories.VesselTypeRepository
{
    public class VesselTypeRepository
    {
        private readonly List<VesselType> _vesselTypes = VesselType.GetAllTypes().ToList();

        public List<VesselType> GetAll() => _vesselTypes;

        public VesselType? GetByName(string name) =>
            _vesselTypes.FirstOrDefault(vt => vt.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

        public List<VesselType> SearchByDescription(string keyword) =>
            _vesselTypes.Where(vt => vt.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase)).ToList();
    }
}
