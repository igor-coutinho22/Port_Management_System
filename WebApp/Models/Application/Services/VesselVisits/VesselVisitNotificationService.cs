using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public interface IVesselVisitNotificationService
    {
        Task<VesselVisitNotification> CreateAsync(VesselVisitNotification notification);
        Task SubmitAsync(Guid id);
    }

    public class VesselVisitNotificationService : IVesselVisitNotificationService
    {
        private readonly IVesselVisitNotificationRepository _repository;

        public VesselVisitNotificationService(IVesselVisitNotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task<VesselVisitNotification> CreateAsync(VesselVisitNotification notification)
        {
            await _repository.AddAsync(notification);
            return notification;
        }

        public async Task SubmitAsync(Guid id)
        {
            var notification = await _repository.GetByIdAsync(id);
            if (notification == null)
                throw new KeyNotFoundException("Vessel Visit Notification not found.");

            notification.MarkAsSubmitted();
            await _repository.UpdateAsync(notification);
        }
    }
}
