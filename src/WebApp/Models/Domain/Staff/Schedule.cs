namespace WebApp.Models.Domain.Staff
{
    public class Schedule
    {
        public TimeOnly StartTime { get; private set; }
        public TimeOnly EndTime { get; private set; }
        public string DaysOfWeek { get; private set; } = default!; 

        protected Schedule() { } // EF Core

        public Schedule(TimeOnly startTime, TimeOnly endTime, string daysOfWeek)
        {
            if (endTime <= startTime)
                throw new ArgumentException("End time must be after start time.");

            if (string.IsNullOrWhiteSpace(daysOfWeek))
                throw new ArgumentException("DaysOfWeek cannot be empty.");

            StartTime = startTime;
            EndTime = endTime;
            DaysOfWeek = daysOfWeek;
        }

        // For comparisons (value object equality)
        public override bool Equals(object? obj)
        {
            if (obj is not Schedule other) return false;
            return StartTime == other.StartTime
                   && EndTime == other.EndTime
                   && DaysOfWeek == other.DaysOfWeek;
        }

        public override int GetHashCode() =>
            HashCode.Combine(StartTime, EndTime, DaysOfWeek);
    }
}
