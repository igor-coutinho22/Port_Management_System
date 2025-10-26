using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using WebApp.Models.Context;

public class OrganizationControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrganizationControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the real DbContext
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<PortManagementContext>));
                if (descriptor != null) services.Remove(descriptor);

                // Add InMemory DbContext for tests
                services.AddDbContext<PortManagementContext>(options =>
                    options.UseInMemoryDatabase("Sys_Org_Tests_DB"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_Then_Get_Organization_ShouldReturn201_And200()
    {
        var postBody = new
        {
            legalName = "SEA & CO",
            alternativeNames = "",
            address = "Rua A",
            taxNumber = "PT123456789",
            representatives = new[] {
                new { name="Ana", citizenId="C1", nationality="PT", email="ana@sea.co", phone="+351911111111" }
            }
        };

        var created = await _client.PostAsJsonAsync("/api/organizations", postBody);
        created.StatusCode.Should().Be(HttpStatusCode.Created);

        // fetch created location
        var location = created.Headers.Location!.ToString();
        var get = await _client.GetAsync(location);
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await get.Content.ReadAsStringAsync();
        json.Should().Contain("SEA & CO").And.Contain("PT123456789");
    }

    [Fact]
    public async Task Post_ShouldFail_WhenNoRepresentatives()
    {
        var postBody = new
        {
            legalName = "Org Sem Rep",
            alternativeNames = "",
            address = "Rua B",
            taxNumber = "PT000"
        };

        var resp = await _client.PostAsJsonAsync("/api/organizations", postBody);
        // Model/state will pass, but service should throw 400/500 -> framework wraps. Expect 400 BadRequest if mapped, else 500.
        resp.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.InternalServerError);
    }
}
