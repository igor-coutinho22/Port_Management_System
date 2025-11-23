/*using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using WebApp;
using WebApp.Models.Application.DTOs;
using Xunit;
namespace WebApp.Tests.Agents
{
    public class OrganizationControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;

    public OrganizationControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Create_And_GetById_ShouldWork()
    {
        var dto = new
        {
            identifier = "ORG-001",
            legalName = "Porto Shipping Co.",
            alternativeName = "PSC",
            address = "Harbor Road 10",
            taxNumber = "TAX12345",
            representatives = new[]
            {
                new
                {
                    name = "Alice Rep",
                    citizenId = "CID123",
                    nationality = "PT",
                    email = "alice@psc.com",
                    phone = "910000000"
                }
            }
        };

        var post = await _client.PostAsJsonAsync("/api/organizations", dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await post.Content.ReadFromJsonAsync<OrganizationDto>();
        created.Should().NotBeNull();

        var get = await _client.GetAsync($"/api/organizations/{created!.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var contents = await get.Content.ReadAsStringAsync();
        contents.Should().Contain("Porto Shipping Co.");
    }

    [Fact]
    public async Task Update_ShouldModifyOrganization()
    {
        var dto = new
        {
            identifier = "ORG-U",
            legalName = "Update Test Co.",
            alternativeName = "UTC",
            address = "Initial Address",
            taxNumber = "TAX888",
            representatives = new[]
            {
                new { name = "Rep", citizenId = "ID1", nationality = "PT", email = "r@u.com", phone = "919999999" }
            }
        };

        var post = await _client.PostAsJsonAsync("/api/organizations", dto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await post.Content.ReadFromJsonAsync<OrganizationDto>();

        var updateDto = new
        {
            alternativeNames = "Updated Alt Names",
            address = "Updated Address"
        };

        var put = await _client.PutAsJsonAsync($"/api/organizations/{created!.Id}", updateDto);
        put.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await put.Content.ReadFromJsonAsync<OrganizationDto>();
        result!.Address.Should().Be("Updated Address");
    }

    [Fact]
    public async Task Search_ShouldReturnResults()
    {
        var dto = new
        {
            identifier = "ORG-S",
            legalName = "Search Test Corp.",
            alternativeName = "STC",
            address = "Search Road",
            taxNumber = "TAX555",
            representatives = new[]
            {
                new { name = "Rep", citizenId = "CID", nationality = "PT", email = "rep@test.com", phone = "911111111" }
            }
        };

        await _client.PostAsJsonAsync("/api/organizations", dto);

        var resp = await _client.GetAsync("/api/organizations/search?name=Search");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await resp.Content.ReadAsStringAsync();
        body.Should().Contain("Search Test Corp.");
    }

    [Fact]
    public async Task Activate_And_Deactivate_ShouldToggleStatus()
    {
        var dto = new
        {
            identifier = "ORG-ACT",
            legalName = "Activation Org",
            alternativeName = "AO",
            address = "Address A",
            taxNumber = "TAX777",
            representatives = new[]
            {
                new { name = "Rep", citizenId = "CIDA", nationality = "PT", email = "act@o.com", phone = "911100000" }
            }
        };

        var post = await _client.PostAsJsonAsync("/api/organizations", dto);
        var created = await post.Content.ReadFromJsonAsync<OrganizationDto>();

        var act = await _client.PatchAsync($"/api/organizations/{created!.Id}/activate", null);
        act.StatusCode.Should().Be(HttpStatusCode.OK);

        var deact = await _client.PatchAsync($"/api/organizations/{created.Id}/deactivate", null);
        deact.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Delete_ShouldRemoveOrganization()
    {
        var dto = new
        {
            identifier = "ORG-DEL",
            legalName = "Delete Me Corp",
            alternativeName = "DMC",
            address = "To Delete",
            taxNumber = "TAXDEL",
            representatives = new[]
            {
                new { name = "Rep", citizenId = "CIDD", nationality = "PT", email = "rep@del.com", phone = "911999999" }
            }
        };

        var post = await _client.PostAsJsonAsync("/api/organizations", dto);
        var created = await post.Content.ReadFromJsonAsync<OrganizationDto>();

        var delete = await _client.DeleteAsync($"/api/organizations/{created!.Id}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var get = await _client.GetAsync($"/api/organizations/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync() => Task.CompletedTask;
}

}
*/