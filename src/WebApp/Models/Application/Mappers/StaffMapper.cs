using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Application.Mappers
{
    public static class StaffMapper
    {
        public static StaffDTO ToDTO(Staff staff)
        {
            if (staff == null)
                throw new ArgumentNullException(nameof(staff));

            return new StaffDTO
            {
                MecanographicNumber = staff.MecanographicNumber,
                ShortName = staff.ShortName,
                Email = staff.Email,
                Phone = staff.Phone,
                Status = staff.Status,
                OperationalWindow = staff.OperationalWindow,
                Qualifications = staff.Qualifications
            };
        }

        public static Staff ToDomain(StaffDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Staff(
                dto.MecanographicNumber!,
                dto.ShortName!,
                dto.Email!,
                dto.Phone!,
                dto.Status,
                dto.OperationalWindow!,
                dto.Qualifications ?? new HashSet<WebApp.Models.Domain.Qualifications.Qualification>()
            );
        }
    }
}
