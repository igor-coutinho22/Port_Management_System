namespace WebApp.Models.Domain.Qualifications.Interfaces
{
    public interface IQualificationRepository
    {
        void Add(Qualification qualification);
        Qualification? GetByCode(string code);
        Qualification? GetByName(string name);
        List<Qualification> GetAll();
        void Update(Qualification qualification);
        void Delete(string code);
        Task AddAsync(Qualification qualification);
        Task<Qualification?> GetByCodeAsync(string code);
        Task<Qualification?> GetByNameAsync(string name);
        Task<List<Qualification>> GetAllAsync();
        Task UpdateAsync(Qualification qualification);
        Task DeleteAsync(string code);
        Task DeleteAsync(Qualification code);
    }
}
