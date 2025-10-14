namespace WebApp.Models.Domain.Vessel
{
    
    class FeederVessel : Vessel
    {
        public FeederVessel(string imo, string Vesselname, string operatorName, int bays, int rows, int tiers, int craneCount, double dockLength)
            : base(imo, Vesselname, operatorName, bays, rows, tiers, craneCount, dockLength)
        {
            Type = "Feeder";
        }
    }
}