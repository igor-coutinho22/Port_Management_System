namespace WebApp.Models.Domain.Qualifications.Interfaces
{
    public interface IQualificationService
    {
        Task RegisterQualificationAsync(string code, string name);
        Task<Qualification?> GetByCodeAsync(string code);
        Task<Qualification?> GetByNameAsync(string name);
        Task<List<Qualification>> GetAllAsync();
        Task UpdateQualificationAsync(Qualification qualification);
        Task DeleteAsync(string code);
    }
}
