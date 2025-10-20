using System.Collections.Generic;
using PortManagement.Domain.Enums;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Domain.StorageArea
{
    public class Dock : StorageArea
    {
        // Fixed infrastructure dictates maximum available STS cranes
        public int FixedStsCranesCount { get; set; }

        // An implicit 'capacity' constraint based on vessel size (not strictly TEUs but length/berth space)
        public int MaxVesselLengthMeters { get; set; }

        protected Dock()
        {
            Type = StorageAreaType.Dock;
        }

        public Dock(string name, int maxCapacityTeu, int currentOccupancyTeu, int fixedStsCranesCount, int maxVesselLengthMeters)
            : base(StorageAreaType.Dock, name, maxCapacityTeu, currentOccupancyTeu)
        {
            if (fixedStsCranesCount < 0)
                throw new ArgumentOutOfRangeException(nameof(fixedStsCranesCount), "Fixed STS cranes count must be >= 0.");
            if (maxVesselLengthMeters <= 0)
                throw new ArgumentOutOfRangeException(nameof(maxVesselLengthMeters), "Max vessel length must be > 0 meters.");

            FixedStsCranesCount = fixedStsCranesCount;
            MaxVesselLengthMeters = maxVesselLengthMeters;
        }

        override public string GetUsageDescription()
        {
            return $"Dock for vessel berthing, equipped with {FixedStsCranesCount} STS cranes.";
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