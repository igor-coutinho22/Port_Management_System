using WebApp.Models.Domain.Resources;

namespace WebApp.Models.Infrastructure.Repositories.Resources
{
    public interface IResourceRepository
    {
        void AddResource(Resource vessel);
        Resource? GetById(long id);
        Resource? GetByName(string name);
        List<Resource> GetAll();
    }
}
