namespace Oem.Models.Domain.OperationPlans
{
    public class OperationPlanItem
    {
        public Guid Id { get; private set; }

        public Guid OperationPlanId { get; private set; }
        public OperationPlan OperationPlan { get; private set; } = default!;

        // --- Vessel Info ---
        public Guid VesselVisitId { get; private set; }
        public string VesselIMO { get; private set; } = string.Empty;

        // --- The "Total" Slot (From Prolog) ---
        public DateTime ServiceStartTime { get; protected set; }
        public DateTime ServiceEndTime { get; protected set; }

        // --- The Specific Windows (Calculated by us) ---
        // Requirement: "planned time windows for loading/unloading"
        public DateTime UnloadingStartTime { get; protected set; }
        public DateTime UnloadingEndTime { get; protected set; }

        public DateTime LoadingStartTime { get; protected set; }
        public DateTime LoadingEndTime { get; protected set; }

        // --- Resources ---
        public int NumberOfCranes { get; protected set; }
        public int NumberOfStaff { get; protected set; }

        protected OperationPlanItem() { } // For EF Core

        public OperationPlanItem(Guid operationPlanId, Guid vesselVisitId, string vesselIMO,
                                 DateTime serviceStartTime, DateTime serviceEndTime,
                                 DateTime unloadingStartTime, DateTime unloadingEndTime,
                                 DateTime loadingStartTime, DateTime loadingEndTime,
                                 int numberOfCranes, int numberOfStaff)
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
            NumberOfStaff = numberOfStaff;
        }

        public string UpdateDetails(DateTime newServiceStart, DateTime newServiceEnd,
                                int newCranes, int newStaff,
                                int vvnUnloadWorkload, int vvnLoadWorkload)
        {
            var changes = new List<string>();

            // 1. Calculate Proposed Duration
            double newDurationMinutes = (newServiceEnd - newServiceStart).TotalMinutes;

            // 2. Calculate Minimum Required Time (Inverse Relationship)
            // Formula: Workload / Cranes
            // We use Math.Max(1, ...) to avoid division by zero
            double totalWorkload = vvnUnloadWorkload + vvnLoadWorkload;
            double minRequiredMinutes = totalWorkload / Math.Max(1, newCranes);

            // 3. The Validation Check
            // We allow a tiny buffer (e.g. 0.1) for floating point errors
            if (newDurationMinutes < (minRequiredMinutes - 0.1))
            {
                throw new ArgumentException(
                    $"Invalid Duration: With {newCranes} crane(s), the minimum time required is {Math.Ceiling(minRequiredMinutes)} min. " +
                    $"You allocated {Math.Floor(newDurationMinutes)} min.");
            }

            // 4. Standard Validations
            if (newServiceStart >= newServiceEnd)
                throw new ArgumentException("Start time must be before End time.");

            // 5. Detect Changes
            if (ServiceStartTime != newServiceStart) changes.Add($"Start {ServiceStartTime:HH:mm}->{newServiceStart:HH:mm}");
            if (ServiceEndTime != newServiceEnd) changes.Add($"End {ServiceEndTime:HH:mm}->{newServiceEnd:HH:mm}");
            if (NumberOfCranes != newCranes) changes.Add($"Cranes {NumberOfCranes}->{newCranes}");
            if (NumberOfStaff != newStaff) changes.Add($"Staff {NumberOfStaff}->{newStaff}");

            if (!changes.Any()) return string.Empty;

            // 6. Recalculate Loading/Unloading Split
            // We split the NEW duration based on the ratio of the WORKLOADS
            double unloadRatio = totalWorkload > 0 ? (double)vvnUnloadWorkload / totalWorkload : 0.5;
            double newUnloadDuration = newDurationMinutes * unloadRatio;

            // 7. Apply Updates
            ServiceStartTime = newServiceStart;
            ServiceEndTime = newServiceEnd;
            NumberOfCranes = newCranes;
            NumberOfStaff = newStaff;

            UnloadingStartTime = newServiceStart;
            UnloadingEndTime = newServiceStart.AddMinutes(newUnloadDuration);
            LoadingStartTime = UnloadingEndTime;
            LoadingEndTime = newServiceEnd;

            return string.Join(", ", changes);
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