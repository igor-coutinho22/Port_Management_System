using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class QualificationService : IQualificationService
    {
        private readonly IQualificationRepository _repository;

        public QualificationService(IQualificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<QualificationDto> CreateAsync(string code, string name)
        {
            var existing = await _repository.GetByCodeAsync(code);
            if (existing != null)
                throw new InvalidOperationException($"Qualification with code '{code}' already exists.");

            var qualification = new Qualification(code, name);
            await _repository.AddAsync(qualification);
            return new QualificationDto(qualification.Id, qualification.Code, qualification.Name);
        }

        public async Task<QualificationDto> UpdateAsync(Guid id, string name)
        {
            var qualification = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Qualification {id} not found.");

            qualification.Update(name);
            await _repository.UpdateAsync(qualification);

            return new QualificationDto(qualification.Id, qualification.Code, qualification.Name);
        }

        public async Task<IEnumerable<QualificationDto>> SearchAsync(string? code, string? name)
        {
            var results = await _repository.SearchAsync(code, name);
            return results.Select(q => new QualificationDto(q.Id, q.Code, q.Name));
        }
    }
}
