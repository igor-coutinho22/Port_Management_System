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
        private readonly IOrganizationRepository _organizationRepository;
        public VesselVisitNotificationService(
            IVesselVisitNotificationRepository repository,
            IVesselRepository vesselRepository,
            IDockRepository dockRepository,
            IOrganizationRepository organizationRepository)
        {
            _repository = repository;
            _vesselRepository = vesselRepository;
            _dockRepository = dockRepository;
            _organizationRepository = organizationRepository;
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
            // Ensuere Organization exists
            var organization = await _organizationRepository.GetByIdAsync(vvn.ShippingAgentOrganizationId);
            if (organization == null)
                throw new InvalidOperationException($"Organization with ID {vvn.ShippingAgentOrganizationId} not found.");

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

            organization.AddVesselVisitNotification(vvn);

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

            if (visit.Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only 'Submitted' visits can be approved.");

            if (visit.DockId != dockId)
                throw new InvalidOperationException("Dock ID must match the assigned dock for approval.");

            DecisionLog log = visit.Approve();
            await _repository.UpdateStatusToApprovedAsync(visit, log);
        }

        public async Task RejectAsync(Guid id, string reason)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            if (visit.Status != VesselVisitStatus.Submitted)
                throw new InvalidOperationException("Only 'Submitted' visits can be rejected.");


            DecisionLog log = visit.Reject(reason);
            await _repository.UpdateStatusToRejectedAsync(visit, log);
        }

        public async Task AddLoadingManifestAsync(Guid id, CargoManifest manifest)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.AddLoadingManifest(manifest);
            await _repository.SaveLMAsync(manifest);
        }

        public async Task AddUnloadingManifestAsync(Guid id, CargoManifest manifest)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.AddUnloadingManifest(manifest);
            await _repository.SaveUMAsync(manifest);
        }

        public async Task RemoveLoadingManifestAsync(Guid id)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            await _repository.DeleteLMAsync(visit.LoadingManifest!);
        }

        public async Task RemoveUnloadingManifestAsync(Guid id)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");
            await _repository.DeleteUMAsync(visit.UnloadingManifest!);
        }

        public async Task AddCrewMemberAsync(Guid id, CrewMember crewMember)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            visit.AddCrewMember(crewMember);
            await _repository.SaveCMAsync(crewMember);
        }

        public async Task RemoveCrewMemberAsync(Guid id, string citizenId)
        {
            var visit = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Vessel Visit Notification not found.");

            await _repository.DeleteCMAsync(visit.Crew.FirstOrDefault(cm => cm.CitizenId == citizenId)!);
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

            // Apply all updates using the domain entity's methods
            existingVisit.UpdateDockId(vvn.DockId);
            existingVisit.UpdateVisitDate(vvn.VisitDate);
            existingVisit.UpdatePurpose(vvn.Purpose);
            existingVisit.UpdateScheduleWindow(vvn.ArrivalTime, vvn.DesiredDepartureTime);
            existingVisit.UpdateEstimatedDurations(vvn.EstimatedLoadingDurationMinutes, vvn.EstimatedUnloadingDurationMinutes);

            // Save the fully updated entity
            await _repository.UpdateAsync(existingVisit);
        }

        public async Task DeleteVesselAsync(Guid id)
        {
            var visitToDelete = await _repository.GetByIdAsync(id);
            if (visitToDelete == null)
                throw new KeyNotFoundException("Vessel Visit Notification not found.");

            await _repository.DeleteAsync(visitToDelete);
        }

        public async Task<IEnumerable<VesselVisitNotificationDTO>> GetAllOnOrgAsync(Guid organizationId)
        {
            var visits = await _repository.GetAllOnOrgAsync(organizationId);
            return visits.Select(VesselVisitNotificationMapper.ToDTO);
        }

        public async Task ApplyScheduleAsync(IEnumerable<VesselScheduleAssignmentDTO> schedule)
        {
            foreach (var a in schedule)
            {
                var visit = await _repository.GetByIdAsync(a.VesselVisitId);
                if (visit == null)
                    throw new KeyNotFoundException($"Vessel Visit {a.VesselVisitId} not found.");

                var dock = await _dockRepository.GetByIdAsync(a.DockId);
                if (dock == null)
                    throw new KeyNotFoundException($"Dock {a.DockId} not found.");

                visit.ApplyScheduledAssignment(
                    a.DockId,
                    a.ArrivalTime,
                    a.DepartureTime
                );

                await _repository.UpdateAsync(visit);
            }
        }

    }
}
