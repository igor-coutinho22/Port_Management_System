using System.Collections.Generic;
using WebApp.Models.Domain.Vessel;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselRepository
    {
        Task AddVesselAsync(Vessel vessel);
        Task<Vessel?> GetByIMOAsync(string imo);
        Task<List<Vessel>> GetByNameAsync(string name);
        Task<List<Vessel>> GetByOperatorAsync(string operatorName);
        Task<List<Vessel>> GetAllAsync();
    }
}
