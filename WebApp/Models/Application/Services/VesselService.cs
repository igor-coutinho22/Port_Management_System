using WebApp.Models.Domain.Vessel;
using WebApp.Models.Repositories;
using System;
using System.Collections.Generic;

namespace WebApp.Models.Application.Services.VesselService
{
    public class VesselService
    {
        private readonly VesselRepository _vesselRepo;

        public VesselService(VesselRepository vesselRepo)
        {
            _vesselRepo = vesselRepo;
        }

        public void RegisterVessel(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers)
        {
            // Validate IMO
            if (!Vessel.IsValidIMO(imo))
                throw new ArgumentException("Invalid IMO number.");

            // Validate dimensions against the vessel type
            if (bays > vesselType.MaxBays || rows > vesselType.MaxRows || tiers > vesselType.MaxTiers)
                throw new ArgumentException("Dimensions exceed the vessel type limits.");

            // Create the vessel
            var vessel = new Vessel(imo, name, operatorName, vesselType, bays, rows, tiers, vesselType.RequiredCraneCount, vesselType.RequiredDockLength);

            // Save it
            _vesselRepo.AddVessel(vessel);
        }

        public Vessel? GetVesselByIMO(string imo) => _vesselRepo.GetByIMO(imo);
        public Vessel? GetVesselByName(string name) => _vesselRepo.GetByName(name);
        public List<Vessel> GetVesselsByOperator(string operatorName) => _vesselRepo.GetByOperator(operatorName);
        public List<Vessel> GetAllVessels() => _vesselRepo.GetAll();
    }
}
