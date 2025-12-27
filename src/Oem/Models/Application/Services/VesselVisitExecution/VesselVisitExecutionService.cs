using Oem.Models.Domain.VesselVisitExecutions;

namespace Oem.Models.Application.Services
{
    public class VesselVisitExecutionService : IVesselVisitExecutionService
    {
        private readonly IVesselVisitExecutionRepository _repository;

        public VesselVisitExecutionService(IVesselVisitExecutionRepository repository)
        {
            _repository = repository;
        }

        public async Task CreateVesselVisitExecutionAsync(VesselVisitExecution vesselVisitExecution)
        {
            if (vesselVisitExecution == null)
            {
                throw new ArgumentNullException(nameof(vesselVisitExecution));
            }

            var existingVesselVisitExecution = await _repository.GetByIdAsync(vesselVisitExecution.Id);
            if (existingVesselVisitExecution != null)
            {
                throw new InvalidOperationException("A Vessel Visit Execution with the same ID already exists.");
            }

            await _repository.AddAsync(vesselVisitExecution);
        }

        public async Task<VesselVisitExecution?> GetVesselVisitExecutionByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException("Invalid ID.", nameof(id));
            }

            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<VesselVisitExecution>> GetAllVesselVisitExecutionsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task DeleteVesselVisitExecutionAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException("Invalid ID.", nameof(id));
            }

            var vvnToDelete = await _repository.GetByIdAsync(id);
            if (vvnToDelete == null)
            {
                throw new InvalidOperationException("Vessel Visit Execution not found.");
            }
            
            await _repository.DeleteAsync(vvnToDelete);
        }
    }
}