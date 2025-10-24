using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IQualificationService
    {
        Task<QualificationDto> CreateAsync(string code, string name);
        Task<QualificationDto> UpdateAsync(Guid id, string name);
        Task<IEnumerable<QualificationDto>> SearchAsync(string? code, string? name);
    }
}
