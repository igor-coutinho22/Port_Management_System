using FluentAssertions;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;

public class VesselControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly string _testRunId;
    private readonly List<string> _createdVesselIMOs;

    public VesselControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _testRunId = Guid.NewGuid().ToString("N")[..8];
        _createdVesselIMOs = new List<string>();
    }

    // Helper method to generate a valid IMO with checksum from test run ID
    private string GenerateValidIMO(string suffix)
    {
        // Convert test run ID to numbers and create a base 6-digit number
        var hash = _testRunId.GetHashCode();
        var baseNumber = Math.Abs(hash) % 900000 + 100000; // Ensures 6 digits (100000-999999)
        
        // Add suffix for uniqueness within the same test run
        var uniqueNumber = (baseNumber + Math.Abs(suffix.GetHashCode())) % 900000 + 100000;
        var first6Digits = uniqueNumber.ToString().PadLeft(6, '0'); // Ensure exactly 6 digits
        
        // Calculate IMO checksum
        int sum = 0;
        for (int i = 0; i < 6; i++)
        {
            sum += (first6Digits[i] - '0') * (7 - i);
        }
        int checkDigit = sum % 10;
        
        return first6Digits + checkDigit;
    }

    // Helper method to create a vessel and track it for cleanup
    private async Task<HttpResponseMessage> CreateVesselWithCleanupAsync(string vesselTypeName, object vesselDto, string imo)
    {
        var response = await _client.PostAsJsonAsync($"/api/vessels?vesselTypeName={vesselTypeName}", vesselDto);
        
        // Only track for cleanup if creation was successful
        if (response.IsSuccessStatusCode)
        {
            _createdVesselIMOs.Add(imo);
        }
        
        return response;
    }

    [Fact]
    public async Task Post_And_Get_Vessel_ShouldWork()
    {
        // Create a vessel
        var uniqueIMO = GenerateValidIMO("test1"); // Generate unique valid IMO
        var vesselDto = new
        {
            IMO = uniqueIMO,
            VesselName = $"Test Ship {_testRunId}",
            OperatorName = $"Test Operator {_testRunId}",
            VesselTypeName = "Container Ship", // Must match seeded vessel type
            RequiredCraneCount = 2,
            RequiredDockLength = 200.5,
            Bays = 18, // Within Container Ship max (20)
            Rows = 12, // Within Container Ship max (18)
            Tiers = 6  // Within Container Ship max (8)
        };

        var post = await CreateVesselWithCleanupAsync("Container Ship", vesselDto, uniqueIMO);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync($"/api/vessels/getByIMO/{uniqueIMO}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Test Ship {_testRunId}");
        body.Should().Contain($"Test Operator {_testRunId}");
    }

    [Fact]
    public async Task Post_Another_Vessel_ShouldWork()
    {
        // Create another vessel with different vessel type
        var uniqueIMO = GenerateValidIMO("test2");
        var vesselDto = new
        {
            IMO = uniqueIMO,
            VesselName = $"Bulk Carrier {_testRunId}",
            OperatorName = $"Maritime Corp {_testRunId}",
            VesselTypeName = "Bulk Carrier", // Must match seeded vessel type
            RequiredCraneCount = 1,
            RequiredDockLength = 180.0,
            Bays = 12, // Within Bulk Carrier max (15)
            Rows = 10, // Within Bulk Carrier max (12)
            Tiers = 4  // Within Bulk Carrier max (6)
        };

        var post = await CreateVesselWithCleanupAsync("Bulk Carrier", vesselDto, uniqueIMO);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync($"/api/vessels/getByIMO/{uniqueIMO}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Bulk Carrier {_testRunId}");
        body.Should().Contain("Bulk Carrier"); // vessel type name
    }

    [Fact]
    public async Task Put_UpdateVessel_ShouldWork()
    {
        // First create a vessel
        var uniqueIMO = GenerateValidIMO("test3");
        var originalDto = new
        {
            IMO = uniqueIMO,
            VesselName = $"Original Ship {_testRunId}",
            OperatorName = $"Original Operator {_testRunId}",
            VesselTypeName = "Tanker", // Must match seeded vessel type
            RequiredCraneCount = 1,
            RequiredDockLength = 150.0,
            Bays = 10, // Within Tanker max (18)
            Rows = 8,  // Within Tanker max (10)
            Tiers = 3  // Within Tanker max (4)
        };

        await CreateVesselWithCleanupAsync("Tanker", originalDto, uniqueIMO);

        // Now update it
        var updatedDto = new
        {
            IMO = uniqueIMO, // Same IMO
            VesselName = $"Updated Ship {_testRunId}",
            OperatorName = $"Updated Operator {_testRunId}",
            VesselTypeName = "Tanker", // Must match seeded vessel type
            RequiredCraneCount = 3,
            RequiredDockLength = 250.0,
            Bays = 15, // Within Tanker max (18)
            Rows = 9,  // Within Tanker max (10)
            Tiers = 4  // Within Tanker max (4)
        };

        var put = await _client.PutAsJsonAsync($"/api/vessels/{uniqueIMO}?vesselTypeName={updatedDto.VesselTypeName}", updatedDto);
        put.StatusCode.Should().Be(HttpStatusCode.Created);

        // Verify the update
        var get = await _client.GetAsync($"/api/vessels/getByIMO/{uniqueIMO}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Updated Ship {_testRunId}");
        body.Should().Contain($"Updated Operator {_testRunId}");
    }

    [Fact]
    public async Task Get_SearchByNameAndOperator_ShouldWork()
    {
        // Create test vessels
        var vessel1Dto = new
        {
            IMO = GenerateValidIMO("search1"),
            VesselName = $"Search Ship Alpha {_testRunId}",
            OperatorName = $"Alpha Maritime {_testRunId}",
            VesselTypeName = "Container Ship",
            RequiredCraneCount = 2,
            RequiredDockLength = 200.0,
            Bays = 15, // Within Container Ship max (20)
            Rows = 10, // Within Container Ship max (18)
            Tiers = 5  // Within Container Ship max (8)
        };

        var vessel2Dto = new
        {
            IMO = GenerateValidIMO("search2"),
            VesselName = $"Search Ship Beta {_testRunId}",
            OperatorName = $"Beta Shipping {_testRunId}",
            VesselTypeName = "RoRo Ship",
            RequiredCraneCount = 1,
            RequiredDockLength = 180.0,
            Bays = 10, // Within RoRo Ship max (12)
            Rows = 8,  // Within RoRo Ship max (15)
            Tiers = 3  // Within RoRo Ship max (3)
        };

        await CreateVesselWithCleanupAsync("Container Ship", vessel1Dto, GenerateValidIMO("search1"));
        await CreateVesselWithCleanupAsync("RoRo Ship", vessel2Dto, GenerateValidIMO("search2"));

        // Search by name
        var searchByName = await _client.GetAsync($"/api/vessels/searchByNameAndOperator?name=Alpha {_testRunId}");
        searchByName.StatusCode.Should().Be(HttpStatusCode.OK);
        var nameBody = await searchByName.Content.ReadAsStringAsync();
        nameBody.Should().Contain($"Search Ship Alpha {_testRunId}");
        nameBody.Should().NotContain($"Search Ship Beta {_testRunId}");

        // Search by operator
        var searchByOperator = await _client.GetAsync($"/api/vessels/searchByNameAndOperator?operatorName=Beta Shipping {_testRunId}");
        searchByOperator.StatusCode.Should().Be(HttpStatusCode.OK);
        var operatorBody = await searchByOperator.Content.ReadAsStringAsync();
        operatorBody.Should().Contain($"Search Ship Beta {_testRunId}");
        operatorBody.Should().NotContain($"Search Ship Alpha {_testRunId}");
    }

    [Fact]
    public async Task Get_AllVessels_ShouldIncludeCreatedVessels()
    {
        // Create a test vessel
        var vesselDto = new
        {
            IMO = GenerateValidIMO("list1"),
            VesselName = $"List Test Ship {_testRunId}",
            OperatorName = $"List Test Operator {_testRunId}",
            VesselTypeName = "Tanker",
            RequiredCraneCount = 1,
            RequiredDockLength = 160.0,
            Bays = 10, // Within Tanker max (18)
            Rows = 6,  // Within Tanker max (10)
            Tiers = 3  // Within Tanker max (4)
        };

        await CreateVesselWithCleanupAsync("Tanker", vesselDto, GenerateValidIMO("list1"));

        // Get all vessels
        var get = await _client.GetAsync("/api/vessels");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"List Test Ship {_testRunId}");
    }

    [Fact]
    public async Task Delete_Vessel_ShouldWork()
    {
        // Create a vessel to delete
        var uniqueIMO = GenerateValidIMO("delete1");
        var vesselDto = new
        {
            IMO = uniqueIMO,
            VesselName = $"Delete Test Ship {_testRunId}",
            OperatorName = $"Delete Test Operator {_testRunId}",
            VesselTypeName = "RoRo Ship",
            RequiredCraneCount = 1,
            RequiredDockLength = 140.0,
            Bays = 8,  // Within RoRo Ship max (12)
            Rows = 6,  // Within RoRo Ship max (15)
            Tiers = 2  // Within RoRo Ship max (3)
        };

        await CreateVesselWithCleanupAsync("RoRo Ship", vesselDto, uniqueIMO);

        // Verify it exists
        var getBeforeDelete = await _client.GetAsync($"/api/vessels/getByIMO/{uniqueIMO}");
        getBeforeDelete.StatusCode.Should().Be(HttpStatusCode.OK);

        // Delete it
        var delete = await _client.DeleteAsync($"/api/vessels/{uniqueIMO}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Remove from cleanup tracking since it's already deleted
        _createdVesselIMOs.Remove(uniqueIMO);

        // Verify it's gone
        var getAfterDelete = await _client.GetAsync($"/api/vessels/getByIMO/{uniqueIMO}");
        getAfterDelete.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Post_WithInvalidVesselType_ShouldReturnNotFound()
    {
        var vesselDto = new
        {
            IMO = GenerateValidIMO("invalid1"),
            VesselName = $"Invalid Type Ship {_testRunId}",
            OperatorName = $"Test Operator {_testRunId}",
            VesselTypeName = "NonExistentType", // This should still fail
            RequiredCraneCount = 1,
            RequiredDockLength = 100.0,
            Bays = 5,
            Rows = 4,
            Tiers = 2
        };

        var post = await _client.PostAsJsonAsync("/api/vessels?vesselTypeName=NonExistentType", vesselDto);
        post.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Get_NonExistentVessel_ShouldReturnNotFound()
    {
        var get = await _client.GetAsync($"/api/vessels/getByIMO/NONEXISTENT{_testRunId}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_NonExistentVessel_ShouldReturnNotFound()
    {
        var nonExistentIMO = GenerateValidIMO("nonexistent");
        var vesselDto = new
        {
            IMO = nonExistentIMO,
            VesselName = "Test Ship",
            OperatorName = "Test Operator",
            VesselTypeName = "Container Ship",
            RequiredCraneCount = 1,
            RequiredDockLength = 100.0,
            Bays = 5, // Within Container Ship max (20)
            Rows = 4, // Within Container Ship max (18)
            Tiers = 2 // Within Container Ship max (8)
        };

        var put = await _client.PutAsJsonAsync($"/api/vessels/{nonExistentIMO}?vesselTypeName={vesselDto.VesselTypeName}", vesselDto);
        put.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Search_WithoutParameters_ShouldReturnBadRequest()
    {
        var get = await _client.GetAsync("/api/vessels/searchByNameAndOperator");
        get.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    public Task InitializeAsync() => Task.CompletedTask;
    
    public async Task DisposeAsync()
    {
        // Clean up all vessels created during tests
        foreach (var imo in _createdVesselIMOs)
        {
            try
            {
                // Attempt to delete the vessel by IMO
                await _client.DeleteAsync($"/api/vessels/{imo}");
            }
            catch
            {
                // Ignore errors during cleanup to avoid masking test failures
            }
        }
        
        _createdVesselIMOs.Clear();
    }
}
