using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using WebApp.Models.Domain.Resources.Enums;
using FluentAssertions;

public class ResourceControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ResourceControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Uses InMemory DB instead of Azure
                services.RemoveAll(typeof(DbContextOptions<WebApp.Models.Context.PortManagementContext>));
                services.AddDbContext<WebApp.Models.Context.PortManagementContext>(options =>
                    options.UseInMemoryDatabase("SystemResourceTests"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_And_Get_Resource_ShouldWork()
    {
        var dto = new
        {
            id = "R001",
            description = "Crane #1",
            resourceType = ResourceType.STSCrane,
            operationalCapacity = 100,
            status = ResourceAvailabilityStatus.Active,
            setupTime = 15
        };

        var postResponse = await _client.PostAsJsonAsync("/api/resources", dto);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync("/api/resources/R001");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().Contain("Crane #1");
    }

    [Fact]
    public async Task Patch_Deactivate_ShouldUpdateStatus()
    {
        var dto = new
        {
            id = "R002",
            description = "Truck #1",
            resourceType = ResourceType.Truck,
            operationalCapacity = 50,
            status = ResourceAvailabilityStatus.Active,
            setupTime = 5
        };
        await _client.PostAsJsonAsync("/api/resources", dto);

        var response = await _client.PatchAsync("/api/resources/R002/deactivate", null);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await (await _client.GetAsync("/api/resources/R002")).Content.ReadAsStringAsync();
        json.Should().Contain("Inactive");
    }
}
