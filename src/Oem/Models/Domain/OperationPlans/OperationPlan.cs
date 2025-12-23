using Oem.Models.Domain.OperationPlans.Enums;

namespace Oem.Models.Domain.OperationPlans
{
    public class OperationPlan
    {
        private static readonly int MAX_PORT_CRANES = 20;
        private static readonly int MAX_PORT_STAFF = 100;

        public Guid Id { get; set; }
        public DateOnly ScheduleDate { get; set; }
        public string HeuristicUsed { get; set; } = string.Empty;

        public double TotalDelayMinutes { get; set; }
        public double AlgorithmRuntimeSeconds { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Author { get; set; } = string.Empty;

        public OperationPlanStatus Status { get; set; }

        // The list of scheduled movements
        public ICollection<OperationPlanItem> Items { get; set; } = new List<OperationPlanItem>();

        // Audit Log
        public ICollection<OperationPlanAudit> AuditLog { get; set; } = new List<OperationPlanAudit>();

        protected OperationPlan() { } // For EF Core

        public OperationPlan(DateOnly scheduleDate, string heuristicUsed,
                             double totalDelayMinutes, double algorithmRuntimeSeconds, string author)
        {
            Id = Guid.NewGuid();
            ScheduleDate = scheduleDate;
            HeuristicUsed = heuristicUsed;
            TotalDelayMinutes = totalDelayMinutes;
            AlgorithmRuntimeSeconds = algorithmRuntimeSeconds;
            Author = author;
            Status = OperationPlanStatus.Draft;
        }

        public void AddItem(OperationPlanItem item)
        {
            if (Items.Contains(item))
            {
                return;
            }

            Items.Add(item);
        }

        public void RemoveItem(OperationPlanItem item)
        {
            if (Items.Contains(item))
            {
                Items.Remove(item);
            }
        }

        public void AddAuditLog(string author, string reason, string changes)
        {
            AuditLog.Add(new OperationPlanAudit(this.Id, author, reason, changes));
        }

        public void UpdateItem(PlanItemUpdateInfo update, string author, string reason)
        {
            // 1. Find the specific item
            var item = Items.FirstOrDefault(i => i.Id == update.ItemId);

            if (item == null)
            {
                throw new KeyNotFoundException($"Item with ID {update.ItemId} not found in this plan.");
            }

            // 2. Resource Overlap Validation (Collision Check)

            // Find all OTHER items active during the NEW time range
            var overlappingItems = Items
                .Where(i => i.Id != update.ItemId) // Exclude self
                .Where(i => i.ServiceStartTime < update.ServiceEndTime &&
                            i.ServiceEndTime > update.ServiceStartTime) // Time Overlap
                .ToList();

            // Sum resources used by neighbors
            int cranesInUse = overlappingItems.Sum(i => i.NumberOfCranes);
            int staffInUse = overlappingItems.Sum(i => i.NumberOfStaff);

            // Validate Limits
            if (cranesInUse + update.NumberOfCranes > MAX_PORT_CRANES)
            {
                throw new InvalidOperationException(
                    $"Resource Conflict: Updating item {item.VesselIMO} requires {update.NumberOfCranes} cranes, " +
                    $"but {cranesInUse} are already active. Total exceeds limit of {MAX_PORT_CRANES}.");
            }

            if (staffInUse + update.NumberOfStaff > MAX_PORT_STAFF)
            {
                throw new InvalidOperationException(
                    $"Resource Conflict: Updating item {item.VesselIMO} requires {update.NumberOfStaff} staff, " +
                    $"but {staffInUse} are already active. Total exceeds limit of {MAX_PORT_STAFF}.");
            }

            // 3. Proceed to Update (The Item handles physics/math)
            string change = item.UpdateDetails(
                update.ServiceStartTime,
                update.ServiceEndTime,
                update.NumberOfCranes,
                update.NumberOfStaff,
                update.MinUnloadMinutes,
                update.MinLoadMinutes
            );

            // 4. Log if changed
            if (!string.IsNullOrEmpty(change))
            {
                AddAuditLog(author, reason, $"Item {item.VesselIMO}: {change}");
            }
        }
        
        public void RejectPlan()
        {
            if (Status != OperationPlanStatus.Draft)
            {
                throw new InvalidOperationException("Only draft plans can be rejected.");
            }

            Status = OperationPlanStatus.Rejected;
        }

        public void ApprovePlan()
        {
            if (Status != OperationPlanStatus.Draft)
            {
                throw new InvalidOperationException("Only draft plans can be approved.");
            }

            Status = OperationPlanStatus.Approved;
        }

        public void ExecutePlan()
        {
            if (Status != OperationPlanStatus.Approved)
            {
                throw new InvalidOperationException("Only approved plans can be executed.");
            }

            Status = OperationPlanStatus.Executed;
        }

    }
}