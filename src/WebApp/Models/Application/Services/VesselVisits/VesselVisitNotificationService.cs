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

        public VesselVisitNotificationService(
            IVesselVisitNotificationRepository repository,
            IVesselRepository vesselRepository,
            IDockRepository dockRepository)
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
            // Ensure vessel exists (by IMO)
            var vessel = await _vesselRepository.GetByIMOAsync(dto.VesselIMO!);
            if (vessel == null)
                throw new InvalidOperationException($"Vessel with IMO {dto.VesselIMO} not found.");

            // Ensure dock exists
            var dock = await _dockRepository.GetByIdAsync(dto.DockId);
            if (dock == null)
                throw new InvalidOperationException($"Dock with ID {dto.DockId} not found.");

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

            // Domain rule: only InProgress can be submitted
            if (notification.Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be submitted.");

            notification.MarkAsSubmitted();
            await _repository.UpdateAsync(notification);
        }

        public async Task ApproveAsync(Guid id, Guid officerId, Guid dockId)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            // Ensure dock exists
            var dock = await _dockRepository.GetByIdAsync(dockId);
            if (dock == null)
                throw new InvalidOperationException("Dock not found.");

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

        public async Task<IEnumerable<VesselVisitNotificationDTO>> SearchAsync(VesselVisitNotificationFilterDTO filter)
        {
            // Validate that at least one filter parameter is provided
            bool hasAnyFilter = !string.IsNullOrEmpty(filter.VesselIMO) ||
                               !string.IsNullOrEmpty(filter.Status) ||
                               filter.FromDate.HasValue ||
                               filter.ToDate.HasValue ||
                               !string.IsNullOrEmpty(filter.Representative);

            if (!hasAnyFilter)
            {
                throw new InvalidOperationException("At least one search parameter must be provided.");
            }

            var visits = await _repository.GetAllAsync();
            
            // Apply filters
            var filteredVisits = visits.AsQueryable();

            if (!string.IsNullOrEmpty(filter.VesselIMO))
                filteredVisits = filteredVisits.Where(v => v.VesselIMO == filter.VesselIMO);

            if (!string.IsNullOrEmpty(filter.Status))
                filteredVisits = filteredVisits.Where(v => v.Status.ToString().Equals(filter.Status, StringComparison.OrdinalIgnoreCase));

            if (filter.FromDate.HasValue)
                filteredVisits = filteredVisits.Where(v => v.VisitDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                filteredVisits = filteredVisits.Where(v => v.VisitDate <= filter.ToDate.Value);

            var result = filteredVisits.ToList();
            
            // Check if no results found and provide meaningful message
            if (!result.Any())
            {
                var filterDescription = BuildFilterDescription(filter);
                throw new InvalidOperationException($"No vessel visit notifications found with the specified criteria: {filterDescription}");
            }

            return result.Select(VesselVisitNotificationMapper.ToDTO);
        }

        private static string BuildFilterDescription(VesselVisitNotificationFilterDTO filter)
        {
            var criteria = new List<string>();
            
            if (!string.IsNullOrEmpty(filter.VesselIMO))
                criteria.Add($"Vessel IMO: {filter.VesselIMO}");
            
            if (!string.IsNullOrEmpty(filter.Status))
                criteria.Add($"Status: {filter.Status}");
            
            if (filter.FromDate.HasValue)
                criteria.Add($"From Date: {filter.FromDate.Value:yyyy-MM-dd}");
            
            if (filter.ToDate.HasValue)
                criteria.Add($"To Date: {filter.ToDate.Value:yyyy-MM-dd}");
            
            if (!string.IsNullOrEmpty(filter.Representative))
                criteria.Add($"Representative: {filter.Representative}");
            
            return string.Join(", ", criteria);
        }

        public async Task UpdateAsync(Guid id, VesselVisitNotification vvn)
        {
            var existingVisit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            // Only allow updates if the visit is InProgress
            if (existingVisit.Status != VesselVisitStatus.InProgress)
                throw new InvalidOperationException("Only 'InProgress' visits can be updated.");

            // Validate vessel by IMO
            var vessel = await _vesselRepository.GetByIMOAsync(vvn.VesselIMO!);
            if (vessel == null)
                throw new InvalidOperationException("Vessel not found.");

            // Validate dock
            var dock = await _dockRepository.GetByIdAsync(vvn.DockId);
            if (dock == null)
                throw new InvalidOperationException("Dock not found.");

            if (existingVisit.VesselIMO != vvn.VesselIMO)
                throw new InvalidOperationException("Vessel IMO cannot be changed.");
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
