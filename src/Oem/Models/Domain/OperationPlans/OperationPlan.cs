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