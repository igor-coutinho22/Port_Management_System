namespace Oem.Models.Domain.OperationPlans
{
    public class OperationPlanItem
    {
        public Guid Id { get; set; }
        
        public Guid OperationPlanId { get; set; }
        public OperationPlan OperationPlan { get; set; } = default!;

        // --- Vessel Info ---
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = string.Empty;

        // --- The "Total" Slot (From Prolog) ---
        public DateTime ServiceStartTime { get; set; }
        public DateTime ServiceEndTime { get; set; }

        // --- The Specific Windows (Calculated by us) ---
        // Requirement: "planned time windows for loading/unloading"
        public DateTime UnloadingStartTime { get; set; }
        public DateTime UnloadingEndTime { get; set; }
        
        public DateTime LoadingStartTime { get; set; }
        public DateTime LoadingEndTime { get; set; }

        // --- Resources ---
        // Requirement: "assigned resources"
        // If your heuristic is simple, it just says "2 Cranes". 
        // If it's advanced, it might say "Crane #1". 
        // For now, we store the count and a placeholder for specific IDs.
        public int NumberOfCranes { get; set; } 

        protected OperationPlanItem() { } // For EF Core

        public OperationPlanItem(Guid operationPlanId, Guid vesselVisitId, string vesselIMO,
                                 DateTime serviceStartTime, DateTime serviceEndTime,
                                 DateTime unloadingStartTime, DateTime unloadingEndTime,
                                 DateTime loadingStartTime, DateTime loadingEndTime,
                                 int numberOfCranes)
        {
            Id = Guid.NewGuid();
            OperationPlanId = operationPlanId;
            VesselVisitId = vesselVisitId;
            VesselIMO = vesselIMO;
            ValidateTimeWindows(serviceStartTime, serviceEndTime,
                                unloadingStartTime, unloadingEndTime,
                                loadingStartTime, loadingEndTime);
            ServiceStartTime = serviceStartTime;
            ServiceEndTime = serviceEndTime;
            UnloadingStartTime = unloadingStartTime;
            UnloadingEndTime = unloadingEndTime;
            LoadingStartTime = loadingStartTime;
            LoadingEndTime = loadingEndTime;
            NumberOfCranes = numberOfCranes;
        }

        private void ValidateTimeWindows(DateTime serviceStartTime, DateTime serviceEndTime,
                                         DateTime unloadingStartTime, DateTime unloadingEndTime,
                                         DateTime loadingStartTime, DateTime loadingEndTime)
        {
            if (serviceStartTime >= serviceEndTime)
            {
                throw new ArgumentException("Service start time must be before service end time.");
            }

            if (unloadingStartTime >= unloadingEndTime)
            {
                throw new ArgumentException("Unloading start time must be before unloading end time.");
            }

            if (loadingStartTime >= loadingEndTime)
            {
                throw new ArgumentException("Loading start time must be before loading end time.");
            }

            if (unloadingStartTime < serviceStartTime || unloadingEndTime > serviceEndTime)
            {
                throw new ArgumentException("Unloading times must be within the service time window.");
            }

            if (loadingStartTime < serviceStartTime || loadingEndTime > serviceEndTime)
            {
                throw new ArgumentException("Loading times must be within the service time window.");
            }
        }
    }
}