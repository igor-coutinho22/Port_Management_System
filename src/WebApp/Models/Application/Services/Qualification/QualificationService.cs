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
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentNullException(nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));
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

            var existing = await _qualificationRepository.GetByCodeAsync(qualification.Code);
            if (existing == null)
                throw new KeyNotFoundException($"Qualification with code {qualification.Code} not found.");

            existing.Name = qualification.Name;
            await _qualificationRepository.UpdateAsync(existing);
        }

        public Qualification? GetByCode(string code) =>
            _qualificationRepository.GetByCode(code);

        public Qualification? GetByName(string name) =>
            _qualificationRepository.GetByName(name);

        public List<Qualification> GetAll() =>
            _qualificationRepository.GetAll();

        public async Task<Qualification?> GetByCodeAsync(string code) {
            return await _qualificationRepository.GetByCodeAsync(code);
            
        }
        public async Task<Qualification?> GetByNameAsync(string name) {
            return await _qualificationRepository.GetByNameAsync(name);
        }

        public async Task<List<Qualification>> GetAllAsync() =>
            await _qualificationRepository.GetAllAsync();

        public async Task DeleteAsync(string code) {
        var existing = await _qualificationRepository.GetByCodeAsync(code);
        if (existing == null)
            throw new KeyNotFoundException($"Qualification with code {code} not found.");

        await _qualificationRepository.DeleteAsync(existing);
    }
    }
}
