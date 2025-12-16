using System;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Oem.Controllers;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Models.Application.DTOs;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.DTOs.OperationPlans;

namespace Oem.Tests.Controllers
{
    public class OperationPlanControllerTests
    {
        private readonly Mock<IOperationPlanService> _serviceMock;
        private readonly OperationPlanController _controller;

        public OperationPlanControllerTests()
        {
            _serviceMock = new Mock<IOperationPlanService>();
            _controller = new OperationPlanController(_serviceMock.Object);
        }

        [Fact]
        public async Task SearchPlans_ShouldReturnOk_WithPlans()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.Now);
            var plans = new List<OperationPlan> { new OperationPlan(date, "H", 0, 0, "A") };
            _serviceMock.Setup(s => s.SearchPlansAsync(date, null)).ReturnsAsync(plans);

            // Act
            var result = await _controller.SearchPlans(date.ToString("O"), null);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedPlans = okResult.Value.Should().BeAssignableTo<IEnumerable<OperationPlanDTO>>().Subject;
            returnedPlans.Should().HaveCount(1);
        }

        [Fact]
        public async Task UpdatePlan_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            var id = Guid.NewGuid();
            var dto = new UpdateOperationPlanDTO();
            _serviceMock.Setup(s => s.UpdatePlanAsync(id, dto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdatePlan(id, dto);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task RegeneratePlan_ShouldReturnCreated()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.Now);
            var heuristic = "H1";
            var plan = new OperationPlan(date, heuristic, 0, 0, "Sys");
            
            // Assume Controller uses "System" author hardcoded or fetches from User identity which is null here
            // Controller might need HttpContext setup for user identity.
            
            _serviceMock.Setup(s => s.RegeneratePlanAsync(date, heuristic, It.IsAny<string>())).ReturnsAsync(plan);

            // Act
            var result = await _controller.RegeneratePlan(date.ToString("O"), heuristic);

            // Assert
            var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.ActionName.Should().Be(nameof(OperationPlanController.GetPlanById));
        }
    }
}
