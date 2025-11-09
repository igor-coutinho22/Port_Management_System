using Application.DTOs;
using Domain.Scheduling;

namespace WebApp.Models.Application.Mappers
{
    /// <summary>
    /// Maps domain SchedulingResult objects to DTOs for presentation.
    /// </summary>
    public static class SchedulingResultMapper
    {
        public static SchedulingResultDTO ToDTO(SchedulingResult domainResult)
        {
            if (domainResult == null)
                return new SchedulingResultDTO();

            return new SchedulingResultDTO
            {
                Sequence = domainResult.Sequence,
                TotalDelay = domainResult.TotalDelay,
                RuntimeSeconds = domainResult.RuntimeSeconds
            };
        }
    }
}
