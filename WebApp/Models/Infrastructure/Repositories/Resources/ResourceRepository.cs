using WebApp.Models.Domain.Resources;

namespace WebApp.Models.Infrastructure.Repositories.Resources
{
    public class ResourceRepository : IResourceRepository
    {
        private readonly List<Resource> _resources = new List<Resource>();

        public void AddResource(Resource resource)
        {
            if (_resources.Any(v => v.Id == resource.Id))
                throw new ArgumentException("A Resource with this Id already exists.");
            _resources.Add(resource);
        }

        public Resource? GetById(long id) =>
            _resources.FirstOrDefault(r => r.Id == id);

        public Resource? GetByName(string name) =>
            _resources.FirstOrDefault(r => r.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

        public List<Resource> GetAll() => _resources;
    }
}