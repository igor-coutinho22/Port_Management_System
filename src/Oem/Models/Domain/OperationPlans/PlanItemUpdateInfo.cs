namespace Oem.Models.Domain.OperationPlans
{
    // This is NOT a DTO. It is a Domain Value Object used to pass arguments cleanly.
    public class PlanItemUpdateInfo
    {
        public Guid ItemId { get; }
        public DateTime ServiceStartTime { get; }
        public DateTime ServiceEndTime { get; }
        public int NumberOfCranes { get; }
        public int NumberOfStaff { get; }
        public int MinUnloadMinutes { get; } 
        public int MinLoadMinutes { get; }

        protected PlanItemUpdateInfo() { } // For EF Core
        public PlanItemUpdateInfo(Guid itemId, DateTime start, DateTime end, int cranes, int staff, int minUnload, int minLoad)
        {
            ItemId = itemId;
            ServiceStartTime = start;
            ServiceEndTime = end;
            NumberOfCranes = cranes;
            NumberOfStaff = staff;
            MinUnloadMinutes = minUnload;
            MinLoadMinutes = minLoad;
        }
    }
}