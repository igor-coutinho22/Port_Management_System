using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;

namespace WebApp.Models.Application.Services
{
    public class VesselVisitNotificationService : IVesselVisitNotificationService
    {
        private readonly IVesselVisitNotificationRepository _repository;

        public VesselVisitNotificationService(IVesselVisitNotificationRepository repository)
        {
            _repository = repository;
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
    }
}
