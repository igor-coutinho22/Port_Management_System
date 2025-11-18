
using System.Net;
using System.Net.Http.Json;
using WebApp.Models.Domain.Resources.Enums;
using FluentAssertions;
using Xunit;
using System.Net.Http;
using System.Threading.Tasks;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using System.Collections.Generic;
using System;


public class ResourceControllerTests : IClassFixture<TestWebAppFactory>

{
    private readonly HttpClient _client;

    public ResourceControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Post_And_Get_Resource_ShouldWork()
    {

        var dto = new ResourceDTO
        {
            Id = "R999",
            Description = "Crane #1",
            ResourceType = ResourceType.STSCrane,
            OperationalCapacity = 100,
            Status = ResourceAvailabilityStatus.Active,
            SetupTime = 15,
            QualificationRequirements = new HashSet<QualificationDTO>()
        };

        var postResponse = await _client.PostAsJsonAsync("/api/resources", dto);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync("/api/resources/R999");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().Contain("Crane #1");
    }

    [Fact]
    public async Task Patch_Deactivate_ShouldUpdateStatus()
    {
        var dto = new
        {
            Id = "R999",
            Description = "Updated Crane #1",
            ResourceType = ResourceType.STSCrane,
            OperationalCapacity = 100,
            Status = ResourceAvailabilityStatus.Active,
            SetupTime = 15,
            QualificationRequirements = new HashSet<QualificationDTO>()
        };
        await _client.PostAsJsonAsync("/api/resources", dto);

        var response = await _client.PatchAsync("/api/resources/R999/deactivate", null);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await (await _client.GetAsync("/api/resources/R999")).Content.ReadAsStringAsync();
        json.Should().Contain("inactive");
    }

    [Fact]
    public async Task DisposeAsync()
    {
        // Cleanup
        await _client.DeleteAsync("/api/resources/R999");
    }
}
