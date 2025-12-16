using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Oem.Models.Infrastructure.Repositories.OperationPlan;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Infrastructure; // Assuming DbContext is here? Need to find it.

namespace Oem.Tests.Infrastructure
{
    public class OperationPlanRepositoryTests
    {
        private DbContextOptions<OemDbContext> _options;

        public OperationPlanRepositoryTests()
        {
            _options = new DbContextOptionsBuilder<OemDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task SearchAsync_ShouldReturnPlansFilteringByDate()
        {
            // Arrange
            using var context = new OemDbContext(_options);
            var repo = new OperationPlanRepository(context);

            var date1 = new DateOnly(2025, 12, 01);
            var date2 = new DateOnly(2025, 12, 02);

            var plan1 = new OperationPlan(date1, "H1", 0, 0, "A");
            var plan2 = new OperationPlan(date2, "H2", 0, 0, "B");

            await repo.AddAsync(plan1);
            await repo.AddAsync(plan2);

            // Act
            var result = await repo.SearchAsync(date1, null);

            // Assert
            result.Should().HaveCount(1);
            result.First().ScheduleDate.Should().Be(date1);
        }

        [Fact]
        public async Task SearchAsync_ShouldReturnPlansFilteringByVesselIMO()
        {
            // Arrange
            using var context = new OemDbContext(_options);
            var repo = new OperationPlanRepository(context);
            var date = new DateOnly(2025, 12, 01);

            var plan1 = new OperationPlan(date, "H1", 0, 0, "A");
            var item1 = new OperationPlanItem(plan1.Id, Guid.NewGuid(), "IMO999", DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, 1);
            plan1.AddItem(item1);

            var plan2 = new OperationPlan(date, "H2", 0, 0, "B");
            var item2 = new OperationPlanItem(plan2.Id, Guid.NewGuid(), "IMO111", DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, 1);
            plan2.AddItem(item2);

            await repo.AddAsync(plan1);
            await repo.AddAsync(plan2);

            // Act
            var result = await repo.SearchAsync(null, "IMO999");

            // Assert
            result.Should().HaveCount(1);
            result.First().Items.Should().Contain(i => i.VesselIMO == "IMO999");
        }
    }
}
