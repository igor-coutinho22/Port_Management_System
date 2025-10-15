using WebApp.Models.Domain.Common;

namespace WebApp.Models.Domain.Staff
{
    public class Schedule : ValueObject
    {
        public string DaysOfWeek { get; private set; } // Ex: "Mon-Fri"
        public TimeSpan StartTime { get; private set; }
        public TimeSpan EndTime { get; private set; }

        private Schedule() { }

        public Schedule(string daysOfWeek, TimeSpan startTime, TimeSpan endTime)
        {
            DaysOfWeek = daysOfWeek;
            StartTime = startTime;
            EndTime = endTime;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return DaysOfWeek;
            yield return StartTime;
            yield return EndTime;
        }
    }
}
