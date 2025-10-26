using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Context;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

public class VesselVisitNotificationControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public VesselVisitNotificationControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Use in-memory DB instead of real one
                services.RemoveAll(typeof(DbContextOptions<PortManagementContext>));
                services.AddDbContext<PortManagementContext>(options =>
                    options.UseInMemoryDatabase("VesselVisitNotificationTests"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_And_Get_VesselVisitNotification_ShouldWork()
    {
        var dto = new VesselVisitNotificationDTO
        {
            VesselId = Guid.NewGuid(),
            DockId = Guid.NewGuid(),
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
        retrieved!.VesselId.Should().Be(dto.VesselId);
    }

    [Fact]
    public async Task Put_Submit_ShouldChangeStatus()
    {
        var dto = new VesselVisitNotificationDTO
        {
            VesselId = Guid.NewGuid(),
            DockId = Guid.NewGuid(),
            VisitDate = DateTime.UtcNow,
            Purpose = "Maintenance"
        };

        var post = await _client.PostAsJsonAsync("/api/vesselvisitnotification", dto);
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
