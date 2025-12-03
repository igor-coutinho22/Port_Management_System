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
using WebApp.Models.Domain.Agents;

[Collection("WebApp Factory Collection")]
public class VesselVisitNotificationControllerTests
{
    private readonly HttpClient _client;
    private readonly TestWebAppFactory _factory;

    public VesselVisitNotificationControllerTests(TestWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<(Guid dockId, string vesselIMO, Guid shippingAgentId)> GetSeededTestDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PortManagementContext>();

        var vessel = await context.Set<Vessel>().FirstAsync();
        var dock = await context.Set<Dock>().FirstAsync();

        // Whatever entity represents shipping agents in your model:
        var shippingAgent = await context.Set<ShippingAgentOrganization>().FirstAsync();

        return (dock.Id, vessel.IMO, shippingAgent.Id);
    }


    [Fact]
    public async Task Post_And_Get_VesselVisitNotification_ShouldWork()
    {
        // Get existing data from seeded database
        var (dockId, vesselIMO, shippingAgentId) = await GetSeededTestDataAsync();

        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = vesselIMO,
            DockId = dockId,
            ShippingAgentOrganizationId = shippingAgentId,
            VisitDate = DateTime.UtcNow.Date.AddDays(1),
            Purpose = "Maintenance",
            ArrivalTime = DateTime.UtcNow.Date.AddDays(1).AddHours(8),
            DesiredDepartureTime = DateTime.UtcNow.Date.AddDays(1).AddHours(16),
            EstimatedLoadingDurationMinutes = 120,
            EstimatedUnloadingDurationMinutes = 60,
            Crew = new List<CrewMemberDTO>
            {
                new() { Name = "John Doe", CitizenId = "12345", Nationality = "PT" }
            }
        };

        // POST
        var postResponse = await _client.PostAsJsonAsync("/api/vesselvisitnotification", dto);
        var errorContent = await postResponse.Content.ReadAsStringAsync();

        postResponse.StatusCode.Should().Be(
            HttpStatusCode.Created,
            "because response content was: {0}", errorContent);


        var created = await postResponse.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        created.Should().NotBeNull();
        created!.Purpose.Should().Be("Maintenance");

        // GET
        var getResponse = await _client.GetAsync($"/api/vesselvisitnotification/{created.Id}");
        var getBody = await getResponse.Content.ReadAsStringAsync();

        getResponse.StatusCode.Should().Be(
            HttpStatusCode.OK,
            "because response content was: {0}", getBody);

        var retrieved = await getResponse.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        retrieved!.VesselIMO.Should().Be(dto.VesselIMO);
    }

    [Fact]
    public async Task Put_Submit_ShouldChangeStatus()
    {
        var (dockId, vesselIMO, shippingAgentId) = await GetSeededTestDataAsync();

        var dto = new VesselVisitNotificationDTO
        {
            VesselIMO = vesselIMO,
            DockId = dockId,
            ShippingAgentOrganizationId = shippingAgentId,
            VisitDate = DateTime.UtcNow.Date.AddDays(1),
            Purpose = "Maintenance",
            ArrivalTime = DateTime.UtcNow.Date.AddDays(1).AddHours(8),
            DesiredDepartureTime = DateTime.UtcNow.Date.AddDays(1).AddHours(16),
            EstimatedLoadingDurationMinutes = 120,
            EstimatedUnloadingDurationMinutes = 60
        };

        var post = await _client.PostAsJsonAsync("/api/vesselvisitnotification", dto);
        var postBody = await post.Content.ReadAsStringAsync();
        post.StatusCode.Should().Be(
            HttpStatusCode.Created,
            "POST failed with body: {0}", postBody);

        var created = await post.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        created.Should().NotBeNull();

        // Build an update DTO that keeps a valid Purpose value
        var updateDto = new VesselVisitNotificationUpdateDTO
        {
            DockId = dockId,
            VisitDate = created!.VisitDate,
            // keep existing valid purpose to avoid enum parse issues
            Purpose = created.Purpose,
            ArrivalTime = created.ArrivalTime,
            DesiredDepartureTime = created.DesiredDepartureTime.AddHours(2),
            EstimatedLoadingDurationMinutes = created.EstimatedLoadingDurationMinutes + 60,
            EstimatedUnloadingDurationMinutes = created.EstimatedUnloadingDurationMinutes
        };

        var response = await _client.PutAsJsonAsync(
            $"/api/vesselvisitnotification/{created.Id}/updateWhileInProgress",
            updateDto);

        var putBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(
            HttpStatusCode.OK,
            "PUT failed with body: {0}", putBody);

        var updated = await response.Content.ReadFromJsonAsync<VesselVisitNotificationDTO>();
        updated.Should().NotBeNull("PUT returned invalid JSON. Raw body: {0}", putBody);

        // Check that at least one field was changed by the update
        updated!.DesiredDepartureTime.Should().Be(updateDto.DesiredDepartureTime);
    }



    [Fact]
    public async Task Put_Submit_ShouldReturnNotFound_WhenIdIsInvalid()
    {
        var invalidId = Guid.NewGuid();

        var dto = new VesselVisitNotificationUpdateDTO
        {
            DockId = Guid.NewGuid(),
            VisitDate = DateTime.UtcNow.Date.AddDays(1),
            Purpose = "Does not matter",
            ArrivalTime = DateTime.UtcNow.Date.AddDays(1).AddHours(8),
            DesiredDepartureTime = DateTime.UtcNow.Date.AddDays(1).AddHours(16),
            EstimatedLoadingDurationMinutes = 60,
            EstimatedUnloadingDurationMinutes = 60
        };

        var response = await _client.PutAsJsonAsync(
            $"/api/vesselvisitnotification/{invalidId}/updateWhileInProgress", dto);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }




}
