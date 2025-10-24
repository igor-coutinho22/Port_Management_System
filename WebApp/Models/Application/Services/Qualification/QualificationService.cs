using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;

namespace WebApp.Models.Application.Services.Qualifications
{
    public class QualificationService : IQualificationService
    {
        private readonly IQualificationRepository _qualificationRepository;

        public QualificationService(IQualificationRepository qualificationRepository)
        {
            _qualificationRepository = qualificationRepository;
        }

        public void RegisterQualification(string code, string name)
        {
            if (_qualificationRepository.GetByCode(code) != null)
                throw new ArgumentException($"Qualification with code '{code}' already exists.");

            var qualification = new Qualification(code, name);
            _qualificationRepository.Add(qualification);
        }

        public async Task RegisterQualificationAsync(string code, string name)
        {
            var existing = await _qualificationRepository.GetByCodeAsync(code);
            if (existing != null)
                throw new ArgumentException($"Qualification with code '{code}' already exists.");

            var qualification = new Qualification(code, name);
            await _qualificationRepository.AddAsync(qualification);
        }

        public void UpdateQualification(Qualification qualification)
        {
            if (qualification == null)
                throw new ArgumentNullException(nameof(qualification));

            _qualificationRepository.Update(qualification);
        }

        public async Task UpdateQualificationAsync(Qualification qualification)
        {
            if (qualification == null)
                throw new ArgumentNullException(nameof(qualification));

            await _qualificationRepository.UpdateAsync(qualification);
        }

        public Qualification? GetByCode(string code) =>
            _qualificationRepository.GetByCode(code);

        public Qualification? GetByName(string name) =>
            _qualificationRepository.GetByName(name);

        public List<Qualification> GetAll() =>
            _qualificationRepository.GetAll();

        public async Task<Qualification?> GetByCodeAsync(string code) =>
            await _qualificationRepository.GetByCodeAsync(code);

        public async Task<Qualification?> GetByNameAsync(string name) =>
            await _qualificationRepository.GetByNameAsync(name);

        public async Task<List<Qualification>> GetAllAsync() =>
            await _qualificationRepository.GetAllAsync();

        public async Task DeleteAsync(string code) =>
            await _qualificationRepository.DeleteAsync(code);
    }
}
