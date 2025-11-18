using FluentAssertions;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;

public class StaffControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly List<string> _createdStaffNumbers = new();
     private readonly List<string> _createdQualificationCodes = new();

    public StaffControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    // -----------------------------------------------------------
    // POST + GET
    // -----------------------------------------------------------
    [Fact]
    public async Task Post_And_Get_Staff_ShouldWork()
    {
        var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8);
        var staffNumber = $"S100_{uniqueId}";
        var dto = new
        {
            mecanographicNumber = staffNumber,
            shortName = "Alice",
            email = "alice@port.com",
            phone = "910000000",
            status = 0, // StaffStatus.Available
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { } // explicit for completeness
        };

    var post = await _client.PostAsJsonAsync("/api/staff", dto);
    post.StatusCode.Should().Be(HttpStatusCode.Created);
    _createdStaffNumbers.Add(staffNumber);

    var get = await _client.GetAsync($"/api/staff/{staffNumber}");
    get.StatusCode.Should().Be(HttpStatusCode.OK);

    var body = await get.Content.ReadAsStringAsync();
    body.Should().Contain("Alice");
    body.Should().Contain(staffNumber);
    }

    // -----------------------------------------------------------
    // ACTIVATE + DEACTIVATE
    // -----------------------------------------------------------
    [Fact]
    public async Task Patch_Activate_And_Deactivate_ShouldUpdateStatus()
    {
        var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8);
        var staffNumber = $"S101_{uniqueId}";
        var dto = new
        {
            mecanographicNumber = staffNumber,
            shortName = "Bob",
            email = "bob@port.com",
            phone = "920000000",
            status = 2, // StaffStatus.Unavailable
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { }
        };

    await _client.PostAsJsonAsync("/api/staff", dto);
    _createdStaffNumbers.Add(staffNumber);

        // Ensure staff is unavailable before activation
        var staffBody = await (await _client.GetAsync($"/api/staff/{staffNumber}")).Content.ReadAsStringAsync();
        staffBody.Should().Contain("unavailable");

        // --- activate ---
        var activate = await _client.PatchAsync($"/api/staff/{staffNumber}/activate", null);
        activate.StatusCode.Should().Be(HttpStatusCode.OK);

        var activatedBody = await (await _client.GetAsync($"/api/staff/{staffNumber}")).Content.ReadAsStringAsync();
        activatedBody.Should().Contain("available");

        // --- deactivate ---
        var deactivate = await _client.PatchAsync($"/api/staff/{staffNumber}/deactivate", null);
        deactivate.StatusCode.Should().Be(HttpStatusCode.OK);

        var deactivatedBody = await (await _client.GetAsync($"/api/staff/{staffNumber}")).Content.ReadAsStringAsync();
        deactivatedBody.Should().Contain("unavailable");
    }

    // -----------------------------------------------------------
    // ADD + REMOVE QUALIFICATION
    // -----------------------------------------------------------
    [Fact]
    public async Task Add_And_Remove_Qualification_ShouldWork()
    {
        var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8);
        var staffNumber = $"S102_{uniqueId}";
        var dto = new
        {
            mecanographicNumber = staffNumber,
            shortName = "Carol",
            email = "carol@port.com",
            phone = "930000000",
            status = 0, // Available
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { }
        };

    await _client.PostAsJsonAsync("/api/staff", dto);
    _createdStaffNumbers.Add(staffNumber);

        // --- ensure qualification exists ---
        var qualificationCode = $"QX_{Guid.NewGuid().ToString("N").Substring(0, 8)}";
        var qualificationCreateDto = new
        {
            code = qualificationCode,
            name = "Crane Operator"
        };
        await _client.PostAsJsonAsync("/api/qualifications", qualificationCreateDto);
         _createdQualificationCodes.Add(qualificationCode);

        // --- add qualification ---
        var qualificationDto = new
        {
            code = qualificationCode,
            name = "Crane Operator",
            dateObtained = (string?)null,
            expiryDate = (string?)null
        };

        var add = await _client.PostAsJsonAsync($"/api/staff/{staffNumber}/qualifications", qualificationDto);
        add.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Confirm it's present
        var withQualification = await (await _client.GetAsync($"/api/staff/{staffNumber}"))
            .Content.ReadAsStringAsync();
        withQualification.Should().Contain(qualificationCode);

        // --- remove qualification ---
        var remove = await _client.DeleteAsync($"/api/staff/{staffNumber}/qualifications/{qualificationCode}");
        remove.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Confirm it's gone
        var afterRemove = await (await _client.GetAsync($"/api/staff/{staffNumber}"))
            .Content.ReadAsStringAsync();
        afterRemove.Should().NotContain(qualificationCode);
    }


    Task IAsyncLifetime.InitializeAsync() => Task.CompletedTask;

    async Task IAsyncLifetime.DisposeAsync()
    {
        foreach (var staffNumber in _createdStaffNumbers)
        {
            try
            {
                await _client.DeleteAsync($"/api/staff/{staffNumber}");
            }
            catch { }
        }
        _createdStaffNumbers.Clear();

        // Delete all test-created qualifications (QX_ prefix)
        var response = await _client.GetAsync("/api/qualifications");
        if (response.IsSuccessStatusCode)
        {
            var qualifications = await response.Content.ReadFromJsonAsync<List<WebApp.Models.Application.DTOs.QualificationDTO>>();
            foreach (var q in qualifications!)
            {
                if (q.Code != null && q.Code.StartsWith("QX_"))
                {
                    try
                    {
                        await _client.DeleteAsync($"/api/qualifications/{q.Code}");
                    }
                    catch { }
                }
            }
        }
        _createdQualificationCodes.Clear();
    }
}