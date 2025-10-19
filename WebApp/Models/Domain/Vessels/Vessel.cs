using System.ComponentModel;
using System.Numerics;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Domain.Vessel
{
    public class Vessel
    {
        // stored in string because if it strats with 0 and is an int/long it will drop the 0
        public string IMO { get; private set; } = null!;
        public string VesselName { get; set; } = null!;
        public string OperatorName { get; set; } = null!;
        public Container[,,] CargoGrid { get; set; } = null!;

        public VesselType VesselType { get; set; } = null!;

        public int RequiredCraneCount { get; set; }
        public double RequiredDockLength { get; set; }

        public int Bays { get; private set; }
        public int Rows { get; private set; }
        public int Tiers { get; private set; }

        protected Vessel() { } // EF Core
        public Vessel(string imo, string vesselName, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            if (!IsValidIMO(imo))
                throw new ArgumentException("Invalid IMO", nameof(imo));

            IMO = imo;
            VesselName = vesselName;
            OperatorName = operatorName;
            VesselType = vesselType;

            CargoGrid = new Container[vesselType.MaxBays, vesselType.MaxRows, vesselType.MaxTiers];

            ValidateDimensions(bays, rows, tiers);

            Bays = bays;
            Rows = rows;
            Tiers = tiers;

            RequiredCraneCount = requiredCraneCount;
            RequiredDockLength = requiredDockLength;
        }

        public static bool IsValidIMO(string imo)
        {
            if (string.IsNullOrWhiteSpace(imo) || imo.Length != 7 || !int.TryParse(imo, out _))
                return false;

            int sum = 0;
            for (int i = 0; i < 6; i++)
                sum += (7 - i) * (imo[i] - '0');

            return sum % 10 == (imo[6] - '0');
        }
        
        public void ValidateDimensions(int bays, int rows, int tiers)
        {
            if (bays > VesselType.MaxBays || rows > VesselType.MaxRows || tiers > VesselType.MaxTiers)
                throw new ArgumentException("Dimensions exceed maximum allowed for this vessel type.");
        }
    }
}