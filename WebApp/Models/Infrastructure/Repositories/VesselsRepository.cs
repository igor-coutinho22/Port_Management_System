namespace WebApp.Models.Repositories.VesselsRepository
{
    public class VesselRepository
    {
        private readonly List<Vessel> _vessels;

        public VesselRepository(List<Vessel> vessels)
        {
            _vessels = vessels;
        }

        public Vessel SearchByIMO(string imo) =>
            _vessels.FirstOrDefault(v => v.IMO == imo);

        public List<Vessel> SearchByName(string name) =>
            _vessels.Where(v => v.Name.Contains(name)).ToList();

        public List<Vessel> SearchByOperator(string operatorName) =>
            _vessels.Where(v => v.OperatorName == operatorName).ToList();
    }
}
