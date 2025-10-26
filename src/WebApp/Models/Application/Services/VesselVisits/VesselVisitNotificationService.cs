using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class VesselVisitNotificationService : IVesselVisitNotificationService
    {
        private readonly IVesselVisitNotificationRepository _repository;
        private readonly IVesselRepository _vesselRepository;
        private readonly IDockRepository _dockRepository;

        public VesselVisitNotificationService(IVesselVisitNotificationRepository repository, IVesselRepository vesselRepository, IDockRepository dockRepository)
        {
            _repository = repository;
            _vesselRepository = vesselRepository;
            _dockRepository = dockRepository;
        }

        public async Task<IEnumerable<VesselVisitNotificationDTO>> GetAllAsync()
        {
            var visits = await _repository.GetAllAsync();
            return visits.Select(VesselVisitNotificationMapper.ToDTO);
        }

        public async Task<VesselVisitNotificationDTO?> GetByIdAsync(Guid id)
        {
            var visit = await _repository.GetByIdAsync(id);
            return visit is null ? null : VesselVisitNotificationMapper.ToDTO(visit);
        }

        public async Task<VesselVisitNotificationDTO> CreateAsync(VesselVisitNotificationDTO dto)
        {
            // Convert DTO → Domain Entity
            var entity = VesselVisitNotificationMapper.ToEntity(dto);

            // Enforce rule: Commercial visits need manifests
            if (entity.Purpose == VisitPurpose.Commercial &&
                entity.LoadingManifest == null &&
                entity.UnloadingManifest == null)
            {
                throw new InvalidOperationException(
                    "Commercial visits must include at least one cargo manifest."
                );
            }

            await _repository.AddAsync(entity);
            return VesselVisitNotificationMapper.ToDTO(entity);
        }

        public async Task SubmitAsync(Guid id)
        {
            var notification = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            notification.MarkAsSubmitted();
            await _repository.UpdateAsync(notification);
        }

        public async Task ApproveAsync(Guid id, Guid officerId, Guid dockId)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.Approve(officerId, dockId);
            await _repository.UpdateAsync(visit);
        }

        public async Task RejectAsync(Guid id, Guid officerId, string reason)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.Reject(officerId, reason);
            await _repository.UpdateAsync(visit);
        }

        public async Task UpdateAsync(Guid id, VesselVisitNotification vvn)
        {
            var existingVisit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            // Only allow updates if the visit is InProgress
            if (existingVisit.Status != VesselVisitStatus.InProgress)
            {
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");
            }

            var vessel = await _vesselRepository.GetByIMOAsync(vvn.VesselIMO!);
            if (vessel == null)
            {
                throw new InvalidOperationException("Vessel not found.");
            }

            var dock = await _dockRepository.GetByIdAsync(vvn.DockId);
            if (dock == null)
            {
                throw new InvalidOperationException("Dock not found.");
            }

            // Update fields
            existingVisit.UpdateVesselIMO(vvn.VesselIMO!);
            existingVisit.UpdatePurpose(vvn.Purpose);
            existingVisit.UpdateDockId(vvn.DockId);
            existingVisit.UpdateVisitDate(vvn.VisitDate);
            existingVisit.UpdateLoadingManifest(vvn.LoadingManifest);
            existingVisit.UpdateUnloadingManifest(vvn.UnloadingManifest);
            existingVisit.UpdateCrew(vvn.Crew);

            await _repository.UpdateAsync(existingVisit);
        }
    }
}
