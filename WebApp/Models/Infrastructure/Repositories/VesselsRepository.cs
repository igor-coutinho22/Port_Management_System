namespace WebApp.Models.Repositories.VesselsRepository
{
    public class VesselRepository
    {
        private readonly List<Vessel> _vessels;

        public VesselRepository(List<Vessel> vessels)
        {
            _vessels = vessels;
        }

        // IMO is unique → return single vessel or null
        public Vessel SearchByIMO(string imo) =>
            _vessels.FirstOrDefault(v => v.IMO == imo);

        // VesselName is unique → return single vessel or null
        public Vessel SearchByName(string name) =>
            _vessels.FirstOrDefault(v => v.VesselName.Equals(name, StringComparison.OrdinalIgnoreCase));

        // Operator/Owner can have multiple vessels → return list
        public List<Vessel> SearchByOperator(string operatorName) =>
            _vessels.Where(v => v.OperatorName.Equals(operatorName, StringComparison.OrdinalIgnoreCase)).ToList();
    }

}
