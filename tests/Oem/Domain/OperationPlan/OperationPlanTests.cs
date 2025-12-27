/*using System;
using Xunit;
using FluentAssertions;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Enums;

namespace Oem.Tests.Domain
{
    public class OperationPlanTests
    {
        [Fact]
        public void CreateOperationPlan_ShouldInitializeCorrectly()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.Now);
            var heuristic = "FCFS";
            var delay = 100.5;
            var runtime = 1.2;
            var author = "Tester";

            // Act
            var plan = new OperationPlan(date, heuristic, delay, runtime, author);

            // Assert
            plan.ScheduleDate.Should().Be(date);
            plan.HeuristicUsed.Should().Be(heuristic);
            plan.TotalDelayMinutes.Should().Be(delay);
            plan.AlgorithmRuntimeSeconds.Should().Be(runtime);
            plan.Author.Should().Be(author);
            plan.Status.Should().Be(OperationPlanStatus.Draft);
            plan.Items.Should().BeEmpty();
            plan.AuditLog.Should().BeEmpty();
        }

        [Fact]
        public void AddItem_ShouldAddItemToCollection()
        {
            // Arrange
            var plan = new OperationPlan(DateOnly.FromDateTime(DateTime.Now), "H1", 0, 0, "A");
            var item = new OperationPlanItem(plan.Id, Guid.NewGuid(), "IMO123", DateTime.Now, DateTime.Now.AddHours(1), DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, 2);

            // Act
            plan.AddItem(item);

            // Assert
            plan.Items.Should().HaveCount(1);
            plan.Items.Should().Contain(item);
        }

        [Fact]
        public void UpdateItem_ShouldUpdatePropertiesAndAddAuditLog()
        {
            // Arrange
            var plan = new OperationPlan(DateOnly.FromDateTime(DateTime.UtcNow), "H1", 0, 0, "A");
            var itemId = Guid.NewGuid();
            var item = new OperationPlanItem(plan.Id, Guid.NewGuid(), "IMO123", 
                DateTime.UtcNow, DateTime.UtcNow.AddHours(1), 
                DateTime.UtcNow, DateTime.UtcNow.AddHours(0.5), 
                DateTime.UtcNow.AddHours(0.5), DateTime.UtcNow.AddHours(1), 2);
            item.GetType().GetProperty("Id")!.SetValue(item, itemId); // Refl hack if Id is private set, assuming standard Entity
            plan.AddItem(item);

            var newStart = DateTime.UtcNow.AddHours(2);
            var newEnd = DateTime.UtcNow.AddHours(3);

            // Act
            plan.UpdateItem(itemId, newStart, newEnd, newStart, newStart.AddMinutes(30), newStart.AddMinutes(30), newEnd, 3, "NewAuthor", "Reason1");

            // Assert
            var updatedItem = plan.Items.First();
            updatedItem.ServiceStartTime.Should().Be(newStart);
            updatedItem.ServiceEndTime.Should().Be(newEnd);
            updatedItem.NumberOfCranes.Should().Be(3);

            plan.AuditLog.Should().HaveCount(1);
            var log = plan.AuditLog.First();
            log.Author.Should().Be("NewAuthor");
            log.Reason.Should().Be("Reason1");
            log.ChangesDescription.Should().Contain("NumberOfCranes");
        }
    }
}
*/