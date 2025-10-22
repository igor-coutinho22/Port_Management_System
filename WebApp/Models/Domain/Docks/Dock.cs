using System.Collections.Generic;
using PortManagement.Domain.Enums;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Domain.Docks
{
    public class Dock
    {
        public int Id { get; protected set; }

        // Fixed infrastructure dictates maximum available STS cranes
        public int FixedStsCranesCount { get; set; }

        // An implicit 'capacity' constraint based on vessel size (not strictly TEUs but length/berth space)
        public int MaxVesselLengthMeters { get; set; }

        protected Dock()
        {
        }

        public Dock(int FixedStsCranesCount, int MaxVesselLengthMeters)
        {
            if (FixedStsCranesCount < 0)
                throw new ArgumentOutOfRangeException(nameof(FixedStsCranesCount), "Fixed STS cranes count must be >= 0.");
            if (MaxVesselLengthMeters <= 0)
                throw new ArgumentOutOfRangeException(nameof(MaxVesselLengthMeters), "Max vessel length must be > 0 meters.");

            this.FixedStsCranesCount = FixedStsCranesCount;
            this.MaxVesselLengthMeters = MaxVesselLengthMeters;
        }

        public void UpdateStsCranesCount(int newCount)
        {
            if (newCount < 0)
                throw new ArgumentOutOfRangeException(nameof(newCount), "Fixed STS cranes count must be >= 0.");
            FixedStsCranesCount = newCount;
        }

        public void UpdateMaxVesselLength(int newLengthMeters)
        {
            if (newLengthMeters <= 0)
                throw new ArgumentOutOfRangeException(nameof(newLengthMeters), "Max vessel length must be > 0 meters.");
            MaxVesselLengthMeters = newLengthMeters;
        }
    }
}