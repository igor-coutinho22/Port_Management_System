using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

public class StaffControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly string _testRunId;
    private readonly List<string> _createdStaffNumbers = new();
    private readonly List<string> _createdQualificationCodes = new();

    public StaffControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _testRunId = Guid.NewGuid().ToString("N")[..8];
    }

    private async Task<string> CreateStaffWithCleanupAsync(string suffix, string shortName, string email, string phone, int status = 1, string operationalWindow = "Mon-Fri 08:00-16:00")
    {
        var mecNumber = $"S{suffix}{_testRunId}";
        var dto = new
        {
            mecanographicNumber = mecNumber,
            shortName,
            email,
            phone,
            status,
            operationalWindow
        };

        var response = await _client.PostAsJsonAsync("/api/staff", dto);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        _createdStaffNumbers.Add(mecNumber);
        return mecNumber;
    }

    private async Task<string> CreateQualificationWithCleanupAsync(string suffix, string name)
    {
        var code = $"Q{suffix}{_testRunId}";
        var dto = new
        {
            code,
            name
        };

        var response = await _client.PostAsJsonAsync("/api/qualifications", dto);
        if (response.StatusCode == HttpStatusCode.Created)
        {
            _createdQualificationCodes.Add(code);
        }
        return code;
    }

    [Fact]
    public async Task Post_And_Get_Staff_ShouldWork()
    {
        var mecNumber = await CreateStaffWithCleanupAsync("100", "Alice", $"alice{_testRunId}@port.com", "910000000");

        var get = await _client.GetAsync($"/api/staff/{mecNumber}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain("Alice");
    }

    [Fact]
    public async Task Patch_Activate_And_Deactivate_ShouldUpdateStatus()
    {
        var mecNumber = await CreateStaffWithCleanupAsync("101", "Bob", $"bob{_testRunId}@port.com", "920000000", 2); // StaffStatus.Unavailable

        var activate = await _client.PatchAsync($"/api/staff/{mecNumber}/activate", null);
        activate.StatusCode.Should().Be(HttpStatusCode.OK);
        (await (await _client.GetAsync($"/api/staff/{mecNumber}")).Content.ReadAsStringAsync())
            .Should().Contain("available");

        var deactivate = await _client.PatchAsync($"/api/staff/{mecNumber}/deactivate", null);
        deactivate.StatusCode.Should().Be(HttpStatusCode.OK);
        (await (await _client.GetAsync($"/api/staff/{mecNumber}")).Content.ReadAsStringAsync())
            .Should().Contain("unavailable");
    }

    [Fact]
    public async Task Add_And_Remove_Qualification_ShouldWork()
    {
        var mecNumber = await CreateStaffWithCleanupAsync("102", "Carol", $"carol{_testRunId}@port.com", "930000000");
        var qualificationCode = await CreateQualificationWithCleanupAsync("X", "Crane Operator");

        // Add qualification
        var qualificationDto = new
        {
            code = qualificationCode,
            name = "Crane Operator",
            dateObtained = (string?)null,
            expiryDate = (string?)null
        };
        var add = await _client.PostAsJsonAsync($"/api/staff/{mecNumber}/qualifications", qualificationDto);
        add.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Remove qualification
        var remove = await _client.DeleteAsync($"/api/staff/{mecNumber}/qualifications/{qualificationCode}");
        remove.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        // Clean up staff members
        foreach (var mecNumber in _createdStaffNumbers)
        {
            await _client.DeleteAsync($"/api/staff/{mecNumber}");
        }

        // Clean up qualifications
        foreach (var code in _createdQualificationCodes)
        {
            await _client.DeleteAsync($"/api/qualifications/{code}");
        }
    }
}
