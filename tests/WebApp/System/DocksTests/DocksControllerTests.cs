using FluentAssertions;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;

[Collection("WebApp Factory Collection")]
public class DocksControllerTests : IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly string _testRunId;
    private readonly List<string> _createdDockIds;

    public DocksControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _testRunId = Guid.NewGuid().ToString("N")[..8];
        _createdDockIds = new List<string>();
    }

    [Fact]
    public async Task Post_And_Get_Dock_ShouldWork()
    {
        // Create a dock
        var dockDto = new
        {
            Name = $"Test Dock {_testRunId}",
            Location = $"Test Location {_testRunId}",
            LengthMeters = 300.5,
            DepthMeters = 15.2,
            MaxDraftMeters = 12.8,
            AllowedVesselTypes = new List<string> { "Container Ship", "Bulk Carrier" }
        };

        var post = await CreateDockWithCleanupAsync(dockDto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        // Extract the created dock ID from location header or response
        var locationHeader = post.Headers.Location?.ToString();
        locationHeader.Should().NotBeNull();
        var dockId = ExtractIdFromLocation(locationHeader!);

        var get = await _client.GetAsync($"/api/docks/{dockId}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Test Dock {_testRunId}");
        body.Should().Contain($"Test Location {_testRunId}");
        body.Should().Contain("300.5");
        body.Should().Contain("15.2");
        body.Should().Contain("12.8");
        body.Should().Contain("Container Ship");
        body.Should().Contain("Bulk Carrier");
    }

    [Fact]
    public async Task Post_Another_Dock_ShouldWork()
    {
        // Create another dock with different vessel types
        var dockDto = new
        {
            Name = $"Tanker Dock {_testRunId}",
            Location = $"Port Terminal B {_testRunId}",
            LengthMeters = 250.0,
            DepthMeters = 18.5,
            MaxDraftMeters = 15.0,
            AllowedVesselTypes = new List<string> { "Tanker", "RoRo Ship" }
        };

        var post = await CreateDockWithCleanupAsync(dockDto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var locationHeader = post.Headers.Location?.ToString();
        locationHeader.Should().NotBeNull();
        var dockId = ExtractIdFromLocation(locationHeader!);

        var get = await _client.GetAsync($"/api/docks/{dockId}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Tanker Dock {_testRunId}");
        body.Should().Contain("Tanker");
        body.Should().Contain("RoRo Ship");
    }

    [Fact]
    public async Task Put_UpdateDock_ShouldWork()
    {
        // First create a dock
        var originalDto = new
        {
            Name = $"Original Dock {_testRunId}",
            Location = $"Original Location {_testRunId}",
            LengthMeters = 200.0,
            DepthMeters = 10.0,
            MaxDraftMeters = 8.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        var postResponse = await CreateDockWithCleanupAsync(originalDto);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var locationHeader = postResponse.Headers.Location?.ToString();
        var dockId = ExtractIdFromLocation(locationHeader!);

        // Now update it
        var updatedDto = new
        {
            Name = $"Updated Dock {_testRunId}",
            Location = $"Updated Location {_testRunId}",
            LengthMeters = 350.0,
            DepthMeters = 20.0,
            MaxDraftMeters = 16.0,
            AllowedVesselTypes = new List<string> { "Container Ship", "Bulk Carrier", "Tanker" }
        };

        var put = await _client.PutAsJsonAsync($"/api/docks/{dockId}", updatedDto);
        put.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the update
        var get = await _client.GetAsync($"/api/docks/{dockId}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Updated Dock {_testRunId}");
        body.Should().Contain($"Updated Location {_testRunId}");
        body.Should().Contain("350");
        body.Should().Contain("20");
        body.Should().Contain("16");
    }

    [Fact]
    public async Task Get_SearchByName_ShouldWork()
    {
        // Create test docks
        var dock1Dto = new
        {
            Name = $"Alpha Dock {_testRunId}",
            Location = $"North Port {_testRunId}",
            LengthMeters = 300.0,
            DepthMeters = 15.0,
            MaxDraftMeters = 12.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        var dock2Dto = new
        {
            Name = $"Beta Dock {_testRunId}",
            Location = $"South Port {_testRunId}",
            LengthMeters = 250.0,
            DepthMeters = 12.0,
            MaxDraftMeters = 10.0,
            AllowedVesselTypes = new List<string> { "Bulk Carrier" }
        };

        await CreateDockWithCleanupAsync(dock1Dto);
        await CreateDockWithCleanupAsync(dock2Dto);

        // Search by name (use more specific search term)
        var searchByName = await _client.GetAsync($"/api/docks/search?name=Alpha Dock");
        searchByName.StatusCode.Should().Be(HttpStatusCode.OK);
        var nameBody = await searchByName.Content.ReadAsStringAsync();
        nameBody.Should().Contain($"Alpha Dock {_testRunId}");
        nameBody.Should().NotContain($"Beta Dock {_testRunId}");
    }

    [Fact]
    public async Task Get_SearchByLocation_ShouldWork()
    {
        // Create test docks
        var dock1Dto = new
        {
            Name = $"Harbor Dock {_testRunId}",
            Location = $"Eastern Harbor {_testRunId}",
            LengthMeters = 300.0,
            DepthMeters = 15.0,
            MaxDraftMeters = 12.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        var dock2Dto = new
        {
            Name = $"Terminal Dock {_testRunId}",
            Location = $"Western Terminal {_testRunId}",
            LengthMeters = 250.0,
            DepthMeters = 12.0,
            MaxDraftMeters = 10.0,
            AllowedVesselTypes = new List<string> { "Bulk Carrier" }
        };

        await CreateDockWithCleanupAsync(dock1Dto);
        await CreateDockWithCleanupAsync(dock2Dto);

        // Search by location (use more specific search term)
        var searchByLocation = await _client.GetAsync($"/api/docks/search?location=Eastern Harbor");
        searchByLocation.StatusCode.Should().Be(HttpStatusCode.OK);
        var locationBody = await searchByLocation.Content.ReadAsStringAsync();
        locationBody.Should().Contain($"Eastern Harbor {_testRunId}");
        locationBody.Should().NotContain($"Western Terminal {_testRunId}");
    }

    [Fact]
    public async Task Get_SearchByVesselType_ShouldWork()
    {
        // Create test docks with different vessel types
        var dock1Dto = new
        {
            Name = $"Container Dock {_testRunId}",
            Location = $"Container Terminal {_testRunId}",
            LengthMeters = 300.0,
            DepthMeters = 15.0,
            MaxDraftMeters = 12.0,
            AllowedVesselTypes = new List<string> { "Container Ship", "Bulk Carrier" }
        };

        var dock2Dto = new
        {
            Name = $"Tanker Berth {_testRunId}",
            Location = $"Oil Terminal {_testRunId}",
            LengthMeters = 250.0,
            DepthMeters = 18.0,
            MaxDraftMeters = 15.0,
            AllowedVesselTypes = new List<string> { "Tanker", "RoRo Ship" }
        };

        await CreateDockWithCleanupAsync(dock1Dto);
        await CreateDockWithCleanupAsync(dock2Dto);

        // Search by vessel type
        var searchByVesselType = await _client.GetAsync($"/api/docks/search?vesselTypeName=Tanker");
        searchByVesselType.StatusCode.Should().Be(HttpStatusCode.OK);
        var vesselTypeBody = await searchByVesselType.Content.ReadAsStringAsync();
        vesselTypeBody.Should().Contain($"Tanker Berth {_testRunId}");
        vesselTypeBody.Should().NotContain($"Container Dock {_testRunId}");
    }

    [Fact]
    public async Task Get_AllDocks_ShouldIncludeCreatedDocks()
    {
        // Create a test dock
        var dockDto = new
        {
            Name = $"List Test Dock {_testRunId}",
            Location = $"List Test Location {_testRunId}",
            LengthMeters = 280.0,
            DepthMeters = 16.0,
            MaxDraftMeters = 11.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        await CreateDockWithCleanupAsync(dockDto);

        // Get all docks
        var get = await _client.GetAsync("/api/docks");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"List Test Dock {_testRunId}");
    }

    [Fact]
    public async Task Delete_Dock_ShouldWork()
    {
        // Create a dock to delete
        var dockDto = new
        {
            Name = $"Delete Test Dock {_testRunId}",
            Location = $"Delete Test Location {_testRunId}",
            LengthMeters = 200.0,
            DepthMeters = 10.0,
            MaxDraftMeters = 8.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        var postResponse = await CreateDockWithCleanupAsync(dockDto);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var locationHeader = postResponse.Headers.Location?.ToString();
        var dockId = ExtractIdFromLocation(locationHeader!);

        // Verify it exists
        var getBeforeDelete = await _client.GetAsync($"/api/docks/{dockId}");
        getBeforeDelete.StatusCode.Should().Be(HttpStatusCode.OK);

        // Delete it
        var delete = await _client.DeleteAsync($"/api/docks/{dockId}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Remove from cleanup tracking since it's already deleted
        _createdDockIds.Remove(dockId);

        // Verify it's gone
        var getAfterDelete = await _client.GetAsync($"/api/docks/{dockId}");
        getAfterDelete.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Post_WithInvalidVesselType_ShouldReturnBadRequest()
    {
        var dockDto = new
        {
            Name = $"Invalid Dock {_testRunId}",
            Location = $"Invalid Location {_testRunId}",
            LengthMeters = 200.0,
            DepthMeters = 10.0,
            MaxDraftMeters = 8.0,
            AllowedVesselTypes = new List<string> { "NonExistentType" }
        };

        var post = await _client.PostAsJsonAsync("/api/docks", dockDto);
        post.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var errorBody = await post.Content.ReadAsStringAsync();
        errorBody.Should().Contain("Vessel type 'NonExistentType' not found");
    }

    [Fact]
    public async Task Post_WithNoVesselTypes_ShouldReturnBadRequest()
    {
        var dockDto = new
        {
            Name = $"No VesselTypes Dock {_testRunId}",
            Location = $"No VesselTypes Location {_testRunId}",
            LengthMeters = 200.0,
            DepthMeters = 10.0,
            MaxDraftMeters = 8.0,
            AllowedVesselTypes = new List<string>() // Empty list
        };

        var post = await _client.PostAsJsonAsync("/api/docks", dockDto);
        post.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var errorBody = await post.Content.ReadAsStringAsync();
        errorBody.Should().Contain("At least one allowed vessel type must be specified");
    }

    [Fact]
    public async Task Get_NonExistentDock_ShouldReturnNotFound()
    {
        var randomId = Guid.NewGuid();
        var get = await _client.GetAsync($"/api/docks/{randomId}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_NonExistentDock_ShouldReturnNotFound()
    {
        var dockDto = new
        {
            Name = "Test Dock",
            Location = "Test Location",
            LengthMeters = 200.0,
            DepthMeters = 10.0,
            MaxDraftMeters = 8.0,
            AllowedVesselTypes = new List<string> { "Container Ship" }
        };

        var randomId = Guid.NewGuid();
        var put = await _client.PutAsJsonAsync($"/api/docks/{randomId}", dockDto);
        put.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Search_WithoutParameters_ShouldReturnBadRequest()
    {
        var get = await _client.GetAsync("/api/docks/search");
        get.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var errorBody = await get.Content.ReadAsStringAsync();
        errorBody.Should().Contain("At least one search parameter");
    }

    // Helper method to extract ID from Location header
    private string ExtractIdFromLocation(string location)
    {
        // Location format: "http://localhost/api/docks/{id}"
        var segments = location.Split('/');
        return segments[^1]; // Last segment is the ID
    }

    // Helper method to create a dock and track it for cleanup
    private async Task<HttpResponseMessage> CreateDockWithCleanupAsync(object dockDto)
    {
        var response = await _client.PostAsJsonAsync("/api/docks", dockDto);
        
        // Only track for cleanup if creation was successful
        if (response.IsSuccessStatusCode && response.Headers.Location != null)
        {
            var dockId = ExtractIdFromLocation(response.Headers.Location.ToString());
            _createdDockIds.Add(dockId);
        }
        
        return response;
    }

    public Task InitializeAsync() => Task.CompletedTask;
    
    public async Task DisposeAsync()
    {
        // Clean up all docks created during tests
        foreach (var dockId in _createdDockIds)
        {
            try
            {
                // Attempt to delete the dock by ID
                await _client.DeleteAsync($"/api/docks/{dockId}");
            }
            catch
            {
                // Ignore errors during cleanup to avoid masking test failures
            }
        }
        
        _createdDockIds.Clear();
    }
}
