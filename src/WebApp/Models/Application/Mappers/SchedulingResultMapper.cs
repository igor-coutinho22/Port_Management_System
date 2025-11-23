using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Scheduling;

namespace WebApp.Models.Application.Mappers
{
    public static class SchedulingResultMapper
    {
        public static SchedulingResultDTO ToDTO(SchedulingResult domain)
        {
            if (domain == null)
                return new SchedulingResultDTO();

            return new SchedulingResultDTO
            {
                HeuristicName = domain.HeuristicName,
                TotalDelayMinutes = domain.TotalDelayMinutes,
                RuntimeSeconds = domain.RuntimeSeconds,
                Warnings = domain.Warnings.ToList(),

                Entries = domain.Entries.Select(e => new VesselScheduleEntryDTO
                {
                    VesselVisitId = e.VesselVisitId,
                    VesselIMO = e.VesselIMO,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    AssignedCraneId = e.AssignedCraneId,
                    StaffMecNumbers = e.StaffMecNumbers.ToList(),
                    DelayMinutes = e.DelayMinutes
                }).ToList()
            };
        }
    }
}
