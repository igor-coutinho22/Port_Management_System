using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Application.Mappers
{
    public static class StaffMapper
    {
        public static StaffDTO ToDTO(Staff staff)
        {
            return new StaffDTO
            {
                MecanographicNumber = staff.MecanographicNumber,
                ShortName = staff.ShortName,
                Email = staff.Email,
                Phone = staff.Phone,
                Status = staff.Status,
                OperationalWindow = staff.OperationalWindow,
                Qualifications = staff.QualificationLinks.Select(link => new QualificationDTO
                {
                    Code = link.Qualification.Code,
                    Name = link.Qualification.Name,
                }).ToList()
            };
        }

        public static Staff ToDomain(StaffDTO dto)
        {
            var staff = new Staff(
                dto.MecanographicNumber!,
                dto.ShortName!,
                dto.Email!,
                dto.Phone!,
                dto.Status,
                dto.OperationalWindow!
            );

            if (dto.Qualifications != null)
            {
                foreach (var q in dto.Qualifications)
                {
                    staff.QualificationLinks.Add(new QualificationLink(
                        dto.MecanographicNumber!,
                        q.Code
                    ));
                }
            }

            return staff;
        }
    }
}
