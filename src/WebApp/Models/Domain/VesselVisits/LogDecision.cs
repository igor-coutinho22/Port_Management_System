namespace WebApp.Models.Domain.VesselVisits
{
    public class DecisionLog
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid OfficerId { get; private set; }
        public DecisionOutcome Outcome { get; private set; }
        public string Message { get; private set; } = default!;
        public DateTime Timestamp { get; private set; }

        private DecisionLog() { }

        public DecisionLog(Guid officerId, DecisionOutcome outcome, string message)
        {
            OfficerId = officerId;
            Outcome = outcome;
            Message = message;
            Timestamp = DateTime.UtcNow;
        }
    }

    public enum DecisionOutcome
    {
        Approved,
        Rejected
    }
}
