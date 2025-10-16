using System.Collections.Generic;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services
{
    public interface IVesselService
    {
        void RegisterVessel(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength);
        
        Vessel? GetVesselByIMO(string imo);
        Vessel? GetVesselByName(string name);
        List<Vessel> GetVesselsByOperator(string operatorName);
        List<Vessel> GetAllVessels();
    }
}
