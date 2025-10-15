using WebApp.Models.Domain.Resources;
using WebApp.Models.Infrastructure.Repositories.Resources;

namespace WebApp.Models.Application.Services.Resources
{
    public class ResourceService : IResourceService
    {
        private readonly IResourceRepository _resourceRepo;

        public ResourceService(IResourceRepository vesselRepo)
        {
            _resourceRepo = vesselRepo;
        }

        public void RegisterResource(long id, string name)
        {
            var resource = new Resource(id, name);

            _resourceRepo.AddResource(resource);
        }

        public Resource? GetResourceById(long id) => _resourceRepo.GetById(id);
        public Resource? GetResourceByName(string name) => _resourceRepo.GetByName(name);
        public List<Resource> GetAllResources() => _resourceRepo.GetAll();
    }
}
