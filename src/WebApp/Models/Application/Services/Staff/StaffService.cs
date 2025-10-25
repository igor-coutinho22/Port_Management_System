using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Staff.Interfaces;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Application.Services.StaffService
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepo;

        public StaffService(IStaffRepository staffRepo)
        {
            _staffRepo = staffRepo;
        }

        public async Task RegisterStaffAsync(string mecanographicNumber, string shortName, string email, string phone,
            StaffStatus status, string operationalWindow)
        {
            var existing = await _staffRepo.GetByMecanographicNumberAsync(mecanographicNumber);
            if (existing != null)
                throw new ArgumentException($"Staff with mecanographic number '{mecanographicNumber}' already exists.");

            var staff = new Staff(mecanographicNumber, shortName, email, phone, status, operationalWindow);
            await _staffRepo.AddAsync(staff);
        }

        public async Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber)
            => await _staffRepo.GetByMecanographicNumberAsync(mecanographicNumber);

        public async Task<List<Staff>> GetAllAsync()
            => await _staffRepo.GetAllAsync();

        public async Task<List<Staff>> GetByStatusAsync(StaffStatus status)
            => await _staffRepo.GetByStatusAsync(status);

        public async Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode)
            => await _staffRepo.SearchAsync(name, status, qualificationCode);

        public async Task UpdateAsync(Staff staff)
        {
            if (staff == null)
                throw new ArgumentNullException(nameof(staff));

            await _staffRepo.UpdateAsync(staff);
        }

        public async Task ActivateAsync(string mecanographicNumber)
        {
            var staff = await _staffRepo.GetByMecanographicNumberAsync(mecanographicNumber)
                ?? throw new KeyNotFoundException($"Staff '{mecanographicNumber}' not found.");

            staff.Activate();
            await _staffRepo.UpdateAsync(staff);
        }

        public async Task DeactivateAsync(string mecanographicNumber)
        {
            var staff = await _staffRepo.GetByMecanographicNumberAsync(mecanographicNumber)
                ?? throw new KeyNotFoundException($"Staff '{mecanographicNumber}' not found.");

            staff.Deactivate();
            await _staffRepo.UpdateAsync(staff);
        }

        public async Task AddQualificationToStaffAsync(string staffNumber, Qualification qualification, DateOnly? obtained = null, DateOnly? expiry = null)
        {
            var staff = await _staffRepo.GetByMecanographicNumberAsync(staffNumber)
                ?? throw new KeyNotFoundException($"Staff '{staffNumber}' not found.");

            staff.QualificationLinks.Add(new QualificationLink(staffNumber, qualification.Code, obtained, expiry));
            await _staffRepo.UpdateAsync(staff);
        }

        public async Task RemoveQualificationFromStaffAsync(string staffNumber, string qualificationCode)
        {
            var staff = await _staffRepo.GetByMecanographicNumberAsync(staffNumber)
                ?? throw new KeyNotFoundException($"Staff '{staffNumber}' not found.");

            var link = staff.QualificationLinks.FirstOrDefault(l => l.QualificationCode == qualificationCode);
            if (link != null)
            {
                staff.QualificationLinks.Remove(link);
                await _staffRepo.UpdateAsync(staff);
            }
        }
    }
}
