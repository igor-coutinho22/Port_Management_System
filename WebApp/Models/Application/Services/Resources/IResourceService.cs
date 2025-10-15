using WebApp.Models.Domain.Resources;

namespace WebApp.Models.Application.Services
{
    public interface IResourceService
    {
        void RegisterResource(long id, string name);
        Resource? GetResourceById(long id);
        Resource? GetResourceByName(string name);
        List<Resource> GetAllResources();

    }
}
