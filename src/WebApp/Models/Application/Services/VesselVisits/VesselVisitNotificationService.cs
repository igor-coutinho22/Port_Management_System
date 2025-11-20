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

        public async Task<VesselVisitNotification?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task CreateAsync(VesselVisitNotification vvn)
        {
            // Ensure vessel exists (by IMO)
            var vessel = await _vesselRepository.GetByIMOAsync(vvn.VesselIMO!);
            if (vessel == null)
                throw new InvalidOperationException($"Vessel with IMO {vvn.VesselIMO} not found.");

            // Ensure dock exists
            var dock = await _dockRepository.GetByIdAsync(vvn.DockId);
            if (dock == null)
                throw new InvalidOperationException($"Dock with ID {vvn.DockId} not found.");

            // Enforce rule: Commercial visits need at least one manifest with at least one container
            if (vvn.Purpose == VisitPurpose.Commercial)
            {
                bool hasLoading = vvn.LoadingManifest != null && vvn.LoadingManifest.Containers != null && vvn.LoadingManifest.Containers.Any(c => !string.IsNullOrWhiteSpace(c.Identifier));
                bool hasUnloading = vvn.UnloadingManifest != null && vvn.UnloadingManifest.Containers != null && vvn.UnloadingManifest.Containers.Any(c => !string.IsNullOrWhiteSpace(c.Identifier));
                if (!hasLoading && !hasUnloading)
                {
                    throw new InvalidOperationException(
                        "Commercial visits must include at least one cargo manifest."
                    );
                }
            }

            await _repository.AddAsync(vvn);
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

        public async Task ApproveAsync(Guid id, Guid dockId)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            // Ensure dock exists
            var dock = await _dockRepository.GetByIdAsync(dockId);
            if (dock == null)
                throw new InvalidOperationException("Dock not found.");

            visit.Approve(dockId);
            await _repository.UpdateAsync(visit);
        }

        public async Task RejectAsync(Guid id, string reason)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.Reject(reason);
            await _repository.UpdateAsync(visit);
        }

        public async Task<IEnumerable<VesselVisitNotificationDTO>> SearchAsync(VesselVisitNotificationFilterDTO filter)
        {
            // Validate that at least one filter parameter is provided
            bool hasAnyFilter = !string.IsNullOrEmpty(filter.VesselIMO) ||
                               !string.IsNullOrEmpty(filter.Status) ||
                               filter.FromDate.HasValue ||
                               filter.ToDate.HasValue;

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
            
            existingVisit.UpdateDockId(vvn.DockId);
            existingVisit.UpdateVisitDate(vvn.VisitDate);
            existingVisit.UpdatePurpose(vvn.Purpose);
            await _repository.UpdateAsync(existingVisit);
        }

        public async Task DeleteVesselAsync(Guid id)
        {
            var visitToDelete = await _repository.GetByIdAsync(id);
            if (visitToDelete == null)
                throw new KeyNotFoundException("Vessel Visit Notification not found.");

            await _repository.DeleteAsync(visitToDelete);
        }
    }
}
