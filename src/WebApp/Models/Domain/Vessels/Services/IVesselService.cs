using System.Collections.Generic;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Vessels;


namespace WebApp.Models.Application.Services
{
    public interface IVesselService
    {
        Task RegisterVesselAsync(Vessel vessel);
        Task UpdateVesselAsync(Vessel vessel);
        Task<Vessel?> GetVesselByIMOAsync(string imo);
        Task<List<Vessel>> GetVesselByNameAsync(string name);
        Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName);
        Task<List<Vessel>> GetAllVesselsAsync();
        Task DeleteVesselAsync(string imo);
    }
}
