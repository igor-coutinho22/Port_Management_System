using System.Collections.Generic;
using WebApp.Models.Domain.Vessel;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselRepository
    {
        void AddVessel(Vessel vessel);
        Vessel? GetByIMO(string imo);
        List<Vessel>? GetByName(string name);
        List<Vessel>? GetByOperator(string operatorName);
        List<Vessel> GetAll();
    }
}
