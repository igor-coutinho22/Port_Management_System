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
using WebApp.Models.Domain.Agents;

public class RepresentativeControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public RepresentativeControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<PortManagementContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<PortManagementContext>(options =>
                    options.UseInMemoryDatabase("Sys_Rep_Tests_DB"));
            });
        }).CreateClient();
    }

    private async Task<Guid> SeedOrganizationAsync()
    {
        using var scope = _client
            .GetTestServer()!
            .Services.CreateScope();
        var ctx = scope.ServiceProvider.GetRequiredService<PortManagementContext>();
        var org = new ShippingAgentOrganization("Org", null, "Rua", "PT1");
        ctx.Organizations.Add(org);
        await ctx.SaveChangesAsync();
        return org.Id;
    }

    [Fact]
    public async Task Create_Update_Activate_Deactivate_List_ShouldWork()
    {
        var orgId = await SeedOrganizationAsync();

        // create
        var createBody = new { name = "Ana", citizenId = "C1", nationality = "PT", email = "a@x.com", phone = "+351911111111" };
        var created = await _client.PostAsJsonAsync($"/api/organizations/{orgId}/representatives", createBody);
        created.StatusCode.Should().Be(HttpStatusCode.Created);

        // read created rep id from list (simpler than parsing Location)
        var listAll = await _client.GetAsync($"/api/organizations/{orgId}/representatives");
        listAll.StatusCode.Should().Be(HttpStatusCode.OK);
        var repsJson = await listAll.Content.ReadAsStringAsync();
        repsJson.Should().Contain("Ana");
        var repId = System.Text.Json.JsonDocument.Parse(repsJson).RootElement[0].GetProperty("id").GetGuid();

        // update
        var updateBody = new { name = "Ana Maria", citizenId = "C2", nationality = "ES", email = "am@x.com", phone = "+34900000000" };
        var updated = await _client.PutAsJsonAsync($"/api/representatives/{repId}", updateBody);
        updated.StatusCode.Should().Be(HttpStatusCode.OK);

        // deactivate
        var deact = await _client.PutAsync($"/api/representatives/{repId}/deactivate", null);
        deact.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var onlyActive = await _client.GetAsync($"/api/organizations/{orgId}/representatives?active=true");
        (await onlyActive.Content.ReadAsStringAsync()).Should().NotContain("Ana Maria");

        // activate
        var act = await _client.PutAsync($"/api/representatives/{repId}/activate", null);
        act.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var activeAgain = await _client.GetAsync($"/api/organizations/{orgId}/representatives?active=true");
        (await activeAgain.Content.ReadAsStringAsync()).Should().Contain("Ana Maria");
    }
}
