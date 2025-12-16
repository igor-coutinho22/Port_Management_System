using System.ComponentModel.DataAnnotations;

namespace Oem.Models.Domain.OperationPlans
{
    public class OperationPlanAudit
    {
        public Guid Id { get; set; }
        
        public Guid OperationPlanId { get; set; }
        public OperationPlan OperationPlan { get; set; } = default!;

        public string Author { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string Reason { get; set; } = string.Empty;
        public string ChangesDescription { get; set; } = string.Empty; // JSON or text summary of what changed

        protected OperationPlanAudit() { }

        public OperationPlanAudit(Guid operationPlanId, string author, string reason, string changesDescription)
        {
            Id = Guid.NewGuid();
            OperationPlanId = operationPlanId;
            Author = author;
            Reason = reason;
            ChangesDescription = changesDescription;
            ChangedAt = DateTime.UtcNow;
        }
    }
}
