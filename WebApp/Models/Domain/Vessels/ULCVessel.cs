namespace WebApp.Models.Domain.Vessel
{
    
    class ULCVessel : Vessel
    {
        public ULCVessel(string imo, string Vesselname, string operatorName, int bays, int rows, int tiers, int craneCount, double dockLength)
            : base(imo, Vesselname, operatorName, bays, rows, tiers, craneCount, dockLength)
        {
            Type = "Ultra Large Container";
        }
    }
}