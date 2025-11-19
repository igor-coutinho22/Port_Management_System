namespace WebApp.Models.Domain.Qualifications.Interfaces
{
    public interface IQualificationRepository
    {
        Task AddAsync(Qualification qualification);
        Task<Qualification?> GetByCodeAsync(string code);
        Task<Qualification?> GetByNameAsync(string name);
        Task<List<Qualification>> GetAllAsync();
        Task UpdateAsync(Qualification qualification);
        Task DeleteAsync(Qualification code);
    }
}
