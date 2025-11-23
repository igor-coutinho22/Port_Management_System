using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Context;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Net.Http;
using Xunit;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels;

public class VesselVisitNotificationControllerTests : IClassFixture<TestWebAppFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebAppFactory _factory;

    public VesselVisitNotificationControllerTests(TestWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<(Guid dockId, string vesselIMO)> GetSeededTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PortManagementContext>();
        
        // Get existing seeded vessel and dock data
        var vessel = await context.Set<Vessel>().FirstAsync();
        var dock = await context.Set<Dock>().FirstAsync();
        
        return (dock.Id, vessel.IMO);
    }
/*
    [Fact]
    public async Task Post_And_Get_VesselVisitNotification_ShouldWork()
    {
        // Get existing data from seeded database
        var (dockId, vesselIMO) = await GetSeededTestDataAsync();
        
        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = vesselIMO,
            DockId = dockId,
            VisitDate = DateTime.UtcNow,
            Purpose = "Maintenance",
            Crew = new List<CrewMemberDTO>
            {
                new() { Name = "John Doe", CitizenId = "1234", Nationality = "PT" }
            }
        };

        // POST
        var postResponse = await _client.PostAsJsonAsync("/api/vesselvisitnotification", dto);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await postResponse.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        created.Should().NotBeNull();
        created!.Purpose.Should().Be("Maintenance");

        // GET
        var getResponse = await _client.GetAsync($"/api/vesselvisitnotification/{created.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var retrieved = await getResponse.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        retrieved!.VesselIMO.Should().Be(dto.VesselIMO);
    }
*/
    [Fact]
    public async Task Put_Submit_ShouldChangeStatus()
    {
        // Get existing seeded data
        var (dockId, vesselIMO) = await GetSeededTestDataAsync();
        
        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = vesselIMO,
            DockId = dockId,
            VisitDate = DateTime.UtcNow,
            Purpose = "Maintenance"
        };

        var post = await _client.PostAsJsonAsync("/api/vesselvisitnotification", dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created); // Ensure the post succeeded first
        var created = await post.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();

        // PUT /submit
        var response = await _client.PutAsync($"/api/vesselvisitnotification/{created!.Id}/submit", null);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Put_Submit_ShouldReturnNotFound_WhenIdIsInvalid()
    {
        var invalidId = Guid.NewGuid();
        var response = await _client.PutAsync($"/api/vesselvisitnotification/{invalidId}/submit", null);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
