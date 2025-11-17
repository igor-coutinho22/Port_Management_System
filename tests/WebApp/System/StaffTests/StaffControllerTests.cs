using FluentAssertions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

public class StaffControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;

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
        var dto = new
        {
            mecanographicNumber = "S100",
            shortName = "Alice",
            email = "alice@port.com",
            phone = "910000000",
            status = 0, // StaffStatus.Available
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { } // explicit for completeness
        };

        var post = await _client.PostAsJsonAsync("/api/staff", dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync("/api/staff/S100");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain("Alice");
        body.Should().Contain("S100");
    }

    // -----------------------------------------------------------
    // ACTIVATE + DEACTIVATE
    // -----------------------------------------------------------
    [Fact]
    public async Task Patch_Activate_And_Deactivate_ShouldUpdateStatus()
    {
        var dto = new
        {
            mecanographicNumber = "S101",
            shortName = "Bob",
            email = "bob@port.com",
            phone = "920000000",
            status = 1, // StaffStatus.Unavailable
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { }
        };

        await _client.PostAsJsonAsync("/api/staff", dto);

        // --- activate ---
        var activate = await _client.PatchAsync("/api/staff/S101/activate", null);
        activate.StatusCode.Should().Be(HttpStatusCode.OK);

        var activatedBody = await (await _client.GetAsync("/api/staff/S101")).Content.ReadAsStringAsync();
        activatedBody.Should().Contain("Available");

        // --- deactivate ---
        var deactivate = await _client.PatchAsync("/api/staff/S101/deactivate", null);
        deactivate.StatusCode.Should().Be(HttpStatusCode.OK);

        var deactivatedBody = await (await _client.GetAsync("/api/staff/S101")).Content.ReadAsStringAsync();
        deactivatedBody.Should().Contain("Unavailable");
    }

    // -----------------------------------------------------------
    // ADD + REMOVE QUALIFICATION
    // -----------------------------------------------------------
    [Fact]
    public async Task Add_And_Remove_Qualification_ShouldWork()
    {
        var dto = new
        {
            mecanographicNumber = "S102",
            shortName = "Carol",
            email = "carol@port.com",
            phone = "930000000",
            status = 0, // Available
            operationalWindow = "Mon-Fri 08:00-16:00",
            qualifications = new object[] { }
        };

        await _client.PostAsJsonAsync("/api/staff", dto);

        // --- add qualification ---
        var qualificationDto = new
        {
            code = "QX",
            name = "Crane Operator",
            dateObtained = (string?)null,
            expiryDate = (string?)null
        };

        var add = await _client.PostAsJsonAsync("/api/staff/S102/qualifications", qualificationDto);
        add.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Confirm it's present
        var withQualification = await (await _client.GetAsync("/api/staff/S102"))
            .Content.ReadAsStringAsync();
        withQualification.Should().Contain("QX");

        // --- remove qualification ---
        var remove = await _client.DeleteAsync("/api/staff/S102/qualifications/QX");
        remove.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Confirm it's gone
        var afterRemove = await (await _client.GetAsync("/api/staff/S102"))
            .Content.ReadAsStringAsync();
        afterRemove.Should().NotContain("QX");
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync() => Task.CompletedTask;
}
