using Oem.Models.Domain.OperationPlans.Enums;

namespace Oem.Models.Domain.OperationPlans
{
    public class OperationPlan
    {
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
            if (Items.Contains(item)) {
                return;
            }

            Items.Add(item);
        }

        public void RemoveItem(OperationPlanItem item)
        {
            if (Items.Contains(item)) {
                Items.Remove(item);
            }
        }

        public void AddAuditLog(string author, string reason, string changes)
        {
           AuditLog.Add(new OperationPlanAudit(this.Id, author, reason, changes));
        }

        public void UpdateItem(Guid itemId, DateTime serviceStart, DateTime serviceEnd, 
                               DateTime unloadingStart, DateTime unloadingEnd, 
                               DateTime loadingStart, DateTime loadingEnd, 
                               int numberOfCranes, string author, string reason)
        {
            var item = Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) throw new ArgumentException("Item not found in plan.");

            // Basic validation is inside the Item constructor, but we want to update it.
            // Since Item properties are public setters, we can update them directly
            // BUT we must validate consistency again.

            // Ideally OperationPlanItem should have an Update() method to encapsulate validation.
            // For now, let's update properties and validate manually or delegate to item.
            
            // We'll trust DTO validation or Service layer for complex checks, 
            // but consistency logic (Start < End) should be enforced.

            if (serviceStart >= serviceEnd) throw new ArgumentException("Service Start must be before End");

            string changes = $"Updated Item {itemId}: " +
                             $"ServiceTime ({item.ServiceStartTime} -> {serviceStart}), " +
                             $"Cranes ({item.NumberOfCranes} -> {numberOfCranes})";

            item.ServiceStartTime = serviceStart;
            item.ServiceEndTime = serviceEnd;
            item.UnloadingStartTime = unloadingStart;
            item.UnloadingEndTime = unloadingEnd;
            item.LoadingStartTime = loadingStart;
            item.LoadingEndTime = loadingEnd;
            item.NumberOfCranes = numberOfCranes;

            AddAuditLog(author, reason, changes);
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