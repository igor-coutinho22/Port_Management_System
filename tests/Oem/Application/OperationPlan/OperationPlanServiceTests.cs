using System;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Moq;
using Oem.Models.Application.Services;
using Oem.Models.Domain.OperationPlans.Repository;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Integration;
using Oem.Models.Domain.Scheduling.Services;
using Oem.Models.Application.DTOs;
using Oem.Models.DTOs.OperationPlans;

namespace Oem.Tests.Application
{
    public class OperationPlanServiceTests
    {
        private readonly Mock<IOperationPlanRepository> _repoMock;
        private readonly Mock<IWebAppService> _webAppMock;
        private readonly Mock<IHeuristicScheduleService> _heuristicMock;
        private readonly OperationPlanService _service;

        public OperationPlanServiceTests()
        {
            _repoMock = new Mock<IOperationPlanRepository>();
            _webAppMock = new Mock<IWebAppService>();
            _heuristicMock = new Mock<IHeuristicScheduleService>();
            _service = new OperationPlanService(_repoMock.Object, _webAppMock.Object, _heuristicMock.Object);
        }

        [Fact]
        public async Task UpdatePlanAsync_ShouldCallRepositoryUpdate()
        {
            // Arrange
            var planId = Guid.NewGuid();
            var plan = new OperationPlan(DateOnly.FromDateTime(DateTime.Now), "H", 0, 0, "A");
            // Set Id
            plan.GetType().GetProperty("Id")!.SetValue(plan, planId);

            var itemId = Guid.NewGuid();
            var item = new OperationPlanItem(planId, Guid.NewGuid(), "IMO", DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, 1);
             item.GetType().GetProperty("Id")!.SetValue(item, itemId);
            plan.AddItem(item);

            _repoMock.Setup(r => r.GetByIdAsync(planId)).ReturnsAsync(plan);

            var dto = new UpdateOperationPlanDTO
            {
                Author = "Updater",
                Reason = "Fix",
                Items = new List<UpdateOperationPlanItemDTO>
                {
                    new UpdateOperationPlanItemDTO { 
                        ItemId = itemId, 
                        NumberOfCranes = 5,
                        ServiceStartTime = DateTime.UtcNow, ServiceEndTime = DateTime.UtcNow.AddHours(2),
                        UnloadingStartTime = DateTime.UtcNow, UnloadingEndTime = DateTime.UtcNow.AddHours(1),
                        LoadingStartTime = DateTime.UtcNow.AddHours(1), LoadingEndTime = DateTime.UtcNow.AddHours(2)
                    }
                }
            };

            // Act
            await _service.UpdatePlanAsync(planId, dto);

            // Assert
            _repoMock.Verify(r => r.UpdateAsync(It.Is<OperationPlan>(p => 
                p.Items.First().NumberOfCranes == 5 && 
                p.AuditLog.Count == 1 // Assuming AuditLog works
            )), Times.Once);
        }

        [Fact]
        public async Task GetMissingPlanVVNsAsync_ShouldReturnVisits_WhenNoPlanExists()
        {
            // Arrange
            var date = new DateOnly(2025, 10, 10);
            var visits = new List<VesselVisitNotificationDTO> { 
                new VesselVisitNotificationDTO { Id = Guid.NewGuid(), VesselIMO = "123" } 
            };
            
            _webAppMock.Setup(w => w.GetApprovedVisitsForDateAsync(date)).ReturnsAsync(visits);
            _repoMock.Setup(r => r.GetByDateAsync(date)).ReturnsAsync((OperationPlan?)null);

            // Act
            var result = await _service.GetMissingPlanVVNsAsync(date);

            // Assert
            result.Should().HaveCount(1);
            result.First().VesselIMO.Should().Be("123");
        }
    }
}
