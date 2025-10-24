namespace WebApp.Models.Domain.Qualifications.Interfaces
{
    public interface IQualificationService
    {
        void RegisterQualification(string code, string name);
        void UpdateQualification(Qualification qualification);
        Qualification? GetByCode(string code);
        Qualification? GetByName(string name);
        List<Qualification> GetAll();
        Task RegisterQualificationAsync(string code, string name);
        Task<Qualification?> GetByCodeAsync(string code);
        Task<Qualification?> GetByNameAsync(string name);
        Task<List<Qualification>> GetAllAsync();
        Task UpdateQualificationAsync(Qualification qualification);
        Task DeleteAsync(string code);
    }
}
