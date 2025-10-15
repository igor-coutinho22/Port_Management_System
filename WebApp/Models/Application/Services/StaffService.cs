using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IQualificationRepository _qualificationRepository;

        public StaffService(IStaffRepository staffRepository, IQualificationRepository qualificationRepository)
        {
            _staffRepository = staffRepository;
            _qualificationRepository = qualificationRepository;
        }

        public async Task<StaffDto> RegisterAsync(string mecanographicNumber, string shortName, string email, string phone, string daysOfWeek, TimeSpan start, TimeSpan end)
        {
            var staff = new Staff(mecanographicNumber, shortName, email, phone, new Schedule(daysOfWeek, start, end));
            await _staffRepository.AddAsync(staff);
            return ToDto(staff);
        }

        public async Task<IEnumerable<StaffDto>> SearchAsync(string? name, string? status)
        {
            var staffList = await _staffRepository.SearchAsync(name, status, null);
            return staffList.Select(ToDto);
        }

        public async Task ChangeStatusAsync(Guid id, string status)
        {
            var staff = await _staffRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Staff not found.");

            if (Enum.TryParse<StaffStatus>(status, true, out var newStatus))
                staff.ChangeStatus(newStatus);
            else
                throw new ArgumentException("Invalid status.");

            await _staffRepository.UpdateAsync(staff);
        }

        public async Task AddQualificationAsync(Guid staffId, Guid qualificationId)
        {
            var staff = await _staffRepository.GetByIdAsync(staffId)
                ?? throw new KeyNotFoundException("Staff not found.");

            var qualification = await _qualificationRepository.GetByIdAsync(qualificationId)
                ?? throw new KeyNotFoundException("Qualification not found.");

            staff.AddQualification(qualification.Id);
            await _staffRepository.UpdateAsync(staff);
        }

        private static StaffDto ToDto(Staff staff) =>
            new(
                staff.Id,
                staff.MecanographicNumber,
                staff.ShortName,
                staff.Email,
                staff.Phone,
                staff.Status.ToString(),
                staff.OperationalWindow.DaysOfWeek,
                staff.OperationalWindow.StartTime.ToString(),
                staff.OperationalWindow.EndTime.ToString()
            );
    }
}
