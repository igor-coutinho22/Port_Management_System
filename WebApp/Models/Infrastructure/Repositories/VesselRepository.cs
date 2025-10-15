using WebApp.Models.Domain.Vessel;

namespace WebApp.Models.Infrastructure.Repositories.VesselRepository
{
    public class VesselRepository : IVesselRepository
    {
        private readonly List<Vessel> _vessels = new List<Vessel>();

        public void AddVessel(Vessel vessel)
        {
            if (_vessels.Any(v => v.IMO == vessel.IMO))
                throw new ArgumentException("A vessel with this IMO number already exists.");
            _vessels.Add(vessel);
        }

        public Vessel? GetByIMO(string imo) =>
            _vessels.FirstOrDefault(v => v.IMO == imo);

        public Vessel? GetByName(string name) =>
            _vessels.FirstOrDefault(v => v.VesselName.Equals(name, StringComparison.OrdinalIgnoreCase));

        public List<Vessel> GetByOperator(string operatorName) =>
            _vessels.Where(v => v.OperatorName.Equals(operatorName, StringComparison.OrdinalIgnoreCase)).ToList();

        public List<Vessel> GetAll() => _vessels;
    }
}
