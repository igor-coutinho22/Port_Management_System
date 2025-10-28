using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;
using FluentAssertions;
using System;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net.Http;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;
using System.Linq;

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
                
                // Disable authentication for tests
                services.AddAuthentication("Test")
                    .AddScheme<TestAuthenticationSchemeOptions, TestAuthenticationHandler>(
                        "Test", options => { });
                
                // Override authorization to allow all
                services.AddAuthorization(options =>
                {
                    options.DefaultPolicy = new AuthorizationPolicyBuilder("Test")
                        .RequireAssertion(context => true)
                        .Build();
                });
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_And_Get_ContainerYard_ShouldWork()
    {
        // First, create a vessel type (required for dock)
        var vesselType = new
        {
            name = "Test Container Ship",
            description = "Container vessel for testing",
            maxBays = 20,
            maxRows = 18,
            maxTiers = 8
        };
        await _client.PostAsJsonAsync("/api/vesseltypes", vesselType);

        // Then create a dock (required for container yard)
        var dock = new
        {
            name = "Test Dock",
            location = "Test Location",
            lengthMeters = 100.0,
            depthMeters = 15.0,
            maxDraftMeters = 12.0,
            allowedVesselTypes = new List<string> { "Test Container Ship" }
        };
        var dockResponse = await _client.PostAsJsonAsync("/api/docks", dock);
        dockResponse.EnsureSuccessStatusCode();
        
        // Get all docks and use the first one (which should be our created dock)
        var allDocksResponse = await _client.GetAsync("/api/docks");
        var allDocksJson = await allDocksResponse.Content.ReadAsStringAsync();
        
        // Use a simple approach - just parse the first dock ID from the JSON
        // This is a simplified approach for testing
        var docksDocument = JsonDocument.Parse(allDocksJson);
        var firstDockId = docksDocument.RootElement[0].GetProperty("id").GetGuid();
        
        // Now create the container yard with the real dock ID
        var yard = new
        {
            name = "Container Yard A",
            maxCapacityTeu = 1000,
            currentOccupancyTeu = 200,
            dockIds = new List<Guid> { firstDockId }
        };

        var postResponse = await _client.PostAsJsonAsync("/api/storageareas/containerYard", yard);
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
            specializedCargoType = "Perishable"
        };

        var postResponse = await _client.PostAsJsonAsync("/api/storageareas/warehouse", warehouse);

        // Debug: Check what we actually got
        var responseContent = await postResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Warehouse Status: {postResponse.StatusCode}, Content: {responseContent}");

        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var getResponse = await _client.GetAsync("/api/storageareas");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().Contain("Warehouse A");
    }
    
    [Fact]
    public async Task Delete_ShouldRemoveStorageArea()
    {
        var warehouse = new
        {
            name = "Warehouse Delete",
            maxCapacityTeu = 600,
            currentOccupancyTeu = 100,
            specializedCargoType = "General"
        };
        await _client.PostAsJsonAsync("/api/storageareas/warehouse", warehouse);

        // Get all storage areas as JSON and parse to extract the correct ID
        var allResponse = await _client.GetAsync("/api/storageareas");
        var allJson = await allResponse.Content.ReadAsStringAsync();
        
        // Parse JSON to find the "Warehouse Delete" storage area ID
        var allDocument = JsonDocument.Parse(allJson);
        var warehouseDeleteId = 0;
        
        foreach (var element in allDocument.RootElement.EnumerateArray())
        {
            if (element.GetProperty("name").GetString() == "Warehouse Delete")
            {
                warehouseDeleteId = element.GetProperty("id").GetInt32();
                break;
            }
        }

        var deleteResponse = await _client.DeleteAsync($"/api/storageareas/{warehouseDeleteId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await _client.GetAsync("/api/storageareas");
        var json = await getResponse.Content.ReadAsStringAsync();
        json.Should().NotContain("Warehouse Delete");
    }
}

public class TestAuthenticationSchemeOptions : AuthenticationSchemeOptions { }

public class TestAuthenticationHandler : AuthenticationHandler<TestAuthenticationSchemeOptions>
{
    public TestAuthenticationHandler(IOptionsMonitor<TestAuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.NameIdentifier, "123"),
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
