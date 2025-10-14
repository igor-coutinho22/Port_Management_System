using System.Numerics;

namespace WebApp.Models.Domain.Vessel
{
    public abstract class Vessel
    {
        private string _imo;

        // stored in string because if it strats with 0 and is an int/long it will drop the 0
        public string IMO
        {
            get => _imo;
            set
            {
                if (!IsValidIMO(value))
                    throw new ArgumentException("Invalid IMO number.");
                _imo = value;
            }
        }
        public string Description { get; set; }
        public string VesselName { get; set; }
        public string OperatorName { get; set; }
        public string Type { get; protected set; }


        // Actual dimensions of this vessel instance
        public int Bays { get; protected set; }
        public int Rows { get; protected set; }
        public int Tiers { get; protected set; }


        // Maximum dimensions allowed for this type
        public int MaxBays { get; protected set; }
        public int MaxRows { get; protected set; }
        public int MaxTiers { get; protected set; }


        public int MaxTEUCapacity => Bays * Rows * Tiers;
        public int RequiredCraneCount { get; protected set; }
        public double RequiredDockLength { get; protected set; }

        public Container[,,] CargoGrid { get; set; }

        protected Vessel(string imo, string vesselName, string operatorName, int bays, int rows, int tiers, int craneCount, double dockLength)
        {
            IMO = imo;
            VesselName = vesselName;
            OperatorName = operatorName;
            Bays = bays;
            Rows = rows;
            Tiers = tiers;
            RequiredCraneCount = craneCount;
            RequiredDockLength = dockLength;

            CargoGrid = new Container[Bays, Rows, Tiers];
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
            if (bays > MaxBays || rows > MaxRows || tiers > MaxTiers)
                throw new ArgumentException("Dimensions exceed maximum allowed for this vessel type.");
        }
        }
}