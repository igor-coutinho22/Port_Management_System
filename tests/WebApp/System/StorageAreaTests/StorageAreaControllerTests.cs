using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

public class StorageAreaControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public StorageAreaControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<PortManagementContext>));
                services.AddDbContext<PortManagementContext>(options =>
                    options.UseInMemoryDatabase("StorageAreaTests"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_And_Get_ContainerYard_ShouldWork()
    {
        var yard = new
        {
            name = "Container Yard A",
            maxCapacityTeu = 1000,
            currentOccupancyTeu = 200,
            type = "ContainerYard"
        };

        var postResponse = await _client.PostAsJsonAsync("/api/storageareas/container-yard", yard);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync("/api/storageareas");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().Contain("Container Yard A");
    }

    [Fact]
    public async Task Post_And_Get_Warehouse_ShouldWork()
    {
        var warehouse = new
        {
            name = "Warehouse A",
            maxCapacityTeu = 500,
            currentOccupancyTeu = 100,
            specializedCargoType = "Perishable",
            type = "Warehouse"
        };

        var postResponse = await _client.PostAsJsonAsync("/api/storageareas/warehouse", warehouse);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync("/api/storageareas");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().Contain("Warehouse A");
    }

    [Fact]
    public async Task Put_UpdateContainerYard_ShouldUpdateSuccessfully()
    {
        var yard = new
        {
            name = "Yard B",
            maxCapacityTeu = 500,
            currentOccupancyTeu = 100,
            type = "ContainerYard"
        };
        await _client.PostAsJsonAsync("/api/storageareas/container-yard", yard);

        // Retrieve all to get ID
        var allResponse = await _client.GetFromJsonAsync<List<ContainerYard>>("/api/storageareas");
        var id = allResponse!.First().Id;

        var updated = new
        {
            name = "Yard B Updated",
            maxCapacityTeu = 800,
            currentOccupancyTeu = 150
        };

        var response = await _client.PutAsJsonAsync($"/api/storageareas/container-yard/{id}", updated);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var verify = await _client.GetAsync("/api/storageareas");
        var json = await verify.Content.ReadAsStringAsync();
        json.Should().Contain("Yard B Updated");
    }

    [Fact]
    public async Task Delete_ShouldRemoveStorageArea()
    {
        var warehouse = new
        {
            name = "Warehouse Delete",
            maxCapacityTeu = 600,
            currentOccupancyTeu = 100,
            specializedCargoType = "General",
            type = "Warehouse"
        };
        await _client.PostAsJsonAsync("/api/storageareas/warehouse", warehouse);

        var allResponse = await _client.GetFromJsonAsync<List<Warehouse>>("/api/storageareas");
        var id = allResponse!.First().Id;

        var deleteResponse = await _client.DeleteAsync($"/api/storageareas/{id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await _client.GetAsync("/api/storageareas");
        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().NotContain("Warehouse Delete");
    }
}
