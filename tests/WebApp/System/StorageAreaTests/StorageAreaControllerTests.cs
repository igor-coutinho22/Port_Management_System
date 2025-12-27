using FluentAssertions;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;
using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Application.DTOs;

[Collection("WebApp Factory Collection")]
public class StorageAreaControllerTests : IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly string _testRunId;
    private readonly List<int> _createdStorageAreaIds;

    public StorageAreaControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _testRunId = Guid.NewGuid().ToString("N")[..8];
        _createdStorageAreaIds = new List<int>();
    }

    [Fact]
    public async Task Post_And_Get_Warehouse_ShouldWork()
    {
        var dto = new WebApp.Models.Application.DTOs.WarehouseDto
        {
            StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
            {
                Name = $"Test Warehouse {_testRunId}",
                MaxCapacityTeu = 500,
                CurrentOccupancyTeu = 100,
                DockConnections = new List<DockStorageAreaConnectionDTO>()
            },
            SpecializedCargoType = "Perishable"
        };

        var post = await CreateWarehouseWithCleanupAsync(dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync("/api/storageareas");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Test Warehouse {_testRunId}");
    }

    [Fact]
    public async Task Post_Another_Warehouse_ShouldWork()
    {
        var dto = new WebApp.Models.Application.DTOs.WarehouseDto
        {
            StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
            {
                Name = $"Cold Storage {_testRunId}",
                MaxCapacityTeu = 300,
                CurrentOccupancyTeu = 50,
                DockConnections = new List<DockStorageAreaConnectionDTO>()
            },
            SpecializedCargoType = "Frozen"
        };

        var post = await CreateWarehouseWithCleanupAsync(dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync("/api/storageareas");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain($"Cold Storage {_testRunId}");
    }

    [Fact]
    public async Task Get_Warehouse_By_Name_ShouldWork()
    {
        // First create a warehouse
        var warehouseName = $"Findable Warehouse {_testRunId}";
        var dto = new WebApp.Models.Application.DTOs.WarehouseDto
        {
            StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
            {
                Name = warehouseName,
                MaxCapacityTeu = 200,
                CurrentOccupancyTeu = 0,
                DockConnections = new List<DockStorageAreaConnectionDTO>()
            },
            SpecializedCargoType = "General"
        };

        var post = await CreateWarehouseWithCleanupAsync(dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        // Then search for it using the correct endpoint
        var get = await _client.GetAsync($"/api/storageareas/GetByName/{warehouseName}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain(warehouseName);
    }

    [Fact]
    public async Task Post_And_Get_ContainerYard_ShouldWork()
    {
        // Get available docks first
        var docksResponse = await _client.GetAsync("/api/docks");
        docksResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var docksJson = await docksResponse.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(docksJson);
        var firstDockId = Guid.Parse(doc.RootElement[0].GetProperty("id").GetString()!);

        // Create a container yard
        var yardName = $"Container Yard {_testRunId}";
        var dto = new WebApp.Models.Application.DTOs.ContainerYardDto
        {
            StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
            {
                Name = yardName,
                MaxCapacityTeu = 1000,
                CurrentOccupancyTeu = 200,
                DockConnections = new List<DockStorageAreaConnectionDTO>()
            },
            DockIds = new List<Guid> { firstDockId }
        };

        var post = await CreateContainerYardWithCleanupAsync(dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync("/api/storageareas");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain(yardName);
    }

    [Fact]
    public async Task Get_ContainerYard_By_Name_ShouldWork()
    {
        // Get available docks first
        var docksResponse = await _client.GetAsync("/api/docks");
        docksResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var docksJson = await docksResponse.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(docksJson);
        var firstDockId = Guid.Parse(doc.RootElement[0].GetProperty("id").GetString()!);

        // First create a container yard
        var yardName = $"Searchable Yard {_testRunId}";
        var dto = new WebApp.Models.Application.DTOs.ContainerYardDto
        {
            StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
            {
                Name = yardName,
                MaxCapacityTeu = 800,
                CurrentOccupancyTeu = 100,
                DockConnections = new List<DockStorageAreaConnectionDTO>()
            },
            DockIds = new List<Guid> { firstDockId }
        };

        var post = await CreateContainerYardWithCleanupAsync(dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        // Then search for it
        var get = await _client.GetAsync($"/api/storageareas/GetByName/{yardName}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain(yardName);
    }

    // Helper method to extract ID from Location header
    private int ExtractIdFromLocation(string location)
    {
        // Location format: "http://localhost/api/storageareas/{id}"
        var segments = location.Split('/');
        return int.Parse(segments[^1]); // Last segment is the ID
    }

    // Helper method to create a warehouse storage area and track it for cleanup
    private async Task<HttpResponseMessage> CreateWarehouseWithCleanupAsync(object warehouseDto)
    {
            // Patch: Ensure StorageArea property is set with required fields
            dynamic dto = warehouseDto;
            if (dto.StorageArea == null)
            {
                dto.StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
                {
                    Name = $"Test Warehouse {_testRunId}",
                    MaxCapacityTeu = 100,
                    CurrentOccupancyTeu = 0,
                    DockConnections = new List<DockStorageAreaConnectionDTO>()
                };
            }
            var response = await _client.PostAsJsonAsync("/api/storageareas/warehouse", (object)dto);
        
        // Only track for cleanup if creation was successful
        if (response.IsSuccessStatusCode && response.Headers.Location != null)
        {
            var storageAreaId = ExtractIdFromLocation(response.Headers.Location.ToString());
            _createdStorageAreaIds.Add(storageAreaId);
        }
        
        return response;
    }

    // Helper method to create a container yard storage area and track it for cleanup
    private async Task<HttpResponseMessage> CreateContainerYardWithCleanupAsync(object containerYardDto)
    {
            // Patch: Ensure StorageArea property is set with required fields
            dynamic dto = containerYardDto;
            if (dto.StorageArea == null)
            {
                dto.StorageArea = new WebApp.Models.Application.DTOs.StorageAreaDTO
                {
                    Name = $"Test Yard {_testRunId}",
                    MaxCapacityTeu = 100,
                    CurrentOccupancyTeu = 0,
                    DockConnections = new List<DockStorageAreaConnectionDTO>()
                };
            }
            var response = await _client.PostAsJsonAsync("/api/storageareas/containerYard", (object)dto);
        
        // Only track for cleanup if creation was successful
        if (response.IsSuccessStatusCode && response.Headers.Location != null)
        {
            var storageAreaId = ExtractIdFromLocation(response.Headers.Location.ToString());
            _createdStorageAreaIds.Add(storageAreaId);
        }
        
        return response;
    }

    public Task InitializeAsync() => Task.CompletedTask;
    
    public async Task DisposeAsync()
    {
        // Clean up all storage areas created during tests
        foreach (var storageAreaId in _createdStorageAreaIds)
        {
            try
            {
                // Attempt to delete the storage area by ID
                await _client.DeleteAsync($"/api/storageareas/{storageAreaId}");
            }
            catch
            {
                // Ignore errors during cleanup to avoid masking test failures
            }
        }
        
        _createdStorageAreaIds.Clear();
    }
}
