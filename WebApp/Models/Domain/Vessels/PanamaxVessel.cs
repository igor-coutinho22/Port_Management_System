using System.ComponentModel.DataAnnotations;

namespace WebApp.Models.Domain.Vessel
{
    class PanamaxVessel : Vessel
    {
        public PanamaxVessel(string imo, string Vesselname, string operatorName, int bays, int rows, int tiers, int craneCount, double dockLength)
            : base(imo, Vesselname, operatorName, bays, rows, tiers, craneCount, dockLength)
        {
            Type = "Panamax";
            MaxBays = 12;
            MaxRows = 10;
            MaxTiers = 6;

            validateDimensions(bays, rows, tiers);
        }
    }
}
