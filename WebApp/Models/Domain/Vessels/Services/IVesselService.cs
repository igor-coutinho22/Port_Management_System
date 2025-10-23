using System.Collections.Generic;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IVesselService
    {
        Task RegisterVesselDTOAsync(VesselDTO dto);
        Task RegisterVesselAsync(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength);
        Task UpdateVesselAsync(string imo, string newIMO, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength);
        Task<Vessel?> GetVesselByIMOAsync(string imo);
        Task<List<Vessel>> GetVesselByNameAsync(string name);
        Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName);
        Task<List<Vessel>> GetAllVesselsAsync();
        Task DeleteVesselAsync(string imo);
    }
}
