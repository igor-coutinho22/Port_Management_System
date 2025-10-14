namespace WebApp.Models.Domain.Vessel
{
    class PostPanamaxVessel : Vessel
    {
        public PostPanamaxVesselVessel(string imo, string Vesselname, string operatorName, int bays, int rows, int tiers, int craneCount, double dockLength)
            : base(imo, Vesselname, operatorName, bays, rows, tiers, craneCount, dockLength)
        {
            Type = "Post-Panamax";
            MaxBays = 14;
            MaxRows = 12;
            MaxTiers = 7;

            validateDimensions(bays, rows, tiers);
        }
    }
}