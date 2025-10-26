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
            operationalWindow = "Mon-Fri 08:00-16:00"
        };

        var post = await _client.PostAsJsonAsync("/api/staff", dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var get = await _client.GetAsync("/api/staff/S100");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain("Alice");
    }

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
            operationalWindow = "Mon-Fri 08:00-16:00"
        };

        await _client.PostAsJsonAsync("/api/staff", dto);

        var activate = await _client.PatchAsync("/api/staff/S101/activate", null);
        activate.StatusCode.Should().Be(HttpStatusCode.OK);
        (await (await _client.GetAsync("/api/staff/S101")).Content.ReadAsStringAsync())
            .Should().Contain("Available");

        var deactivate = await _client.PatchAsync("/api/staff/S101/deactivate", null);
        deactivate.StatusCode.Should().Be(HttpStatusCode.OK);
        (await (await _client.GetAsync("/api/staff/S101")).Content.ReadAsStringAsync())
            .Should().Contain("Unavailable");
    }

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
            operationalWindow = "Mon-Fri 08:00-16:00"
        };
        await _client.PostAsJsonAsync("/api/staff", dto);

        // Add qualification
        var qualificationDto = new
        {
            code = "QX",
            name = "Crane Operator",
            dateObtained = (string?)null,
            expiryDate = (string?)null
        };
        var add = await _client.PostAsJsonAsync("/api/staff/S102/qualifications", qualificationDto);
        add.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Remove qualification
        var remove = await _client.DeleteAsync("/api/staff/S102/qualifications/QX");
        remove.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        // no-op cleanup (endpoints for delete-all not present)
    }
}
