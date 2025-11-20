using System;
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
    public class RepresentativesControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime{
    private readonly HttpClient _client;

    public RepresentativesControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<Guid> CreateOrganizationAsync()
    {
        var orgDto = new
        {
            identifier = "ORG-R",
            legalName = "Representative Org",
            alternativeName = "RO",
            address = "Rep Street",
            taxNumber = "TAXR",
            representatives = new[]
            {
                new { name = "Initial Rep", citizenId = "CID0", nationality = "PT", email = "init@r.com", phone = "910000000" }
            }
        };

        var post = await _client.PostAsJsonAsync("/api/organizations", orgDto);
        var created = await post.Content.ReadFromJsonAsync<OrganizationDto>();
        return created!.Id;
    }

    [Fact]
    public async Task Create_And_Get_Representative_ShouldWork()
    {
        var orgId = await CreateOrganizationAsync();

        var repDto = new
        {
            name = "Alice",
            citizenId = "CID123",
            nationality = "PT",
            email = "alice@org.com",
            phone = "910000001"
        };

        var post = await _client.PostAsJsonAsync($"/api/organizations/{orgId}/representatives", repDto);
        post.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await post.Content.ReadFromJsonAsync<RepresentativeDto>();

        var get = await _client.GetAsync($"/api/organizations/{orgId}/representatives/{created!.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await get.Content.ReadAsStringAsync();
        body.Should().Contain("Alice");
    }

    [Fact]
    public async Task Update_ShouldModifyRepresentative()
    {
        var orgId = await CreateOrganizationAsync();

        var repDto = new
        {
            name = "Bob",
            citizenId = "CIDB",
            nationality = "PT",
            email = "bob@org.com",
            phone = "910222222"
        };

        var post = await _client.PostAsJsonAsync($"/api/organizations/{orgId}/representatives", repDto);
        var created = await post.Content.ReadFromJsonAsync<RepresentativeDto>();

        var updateDto = new
        {
            nationality = "ES",
            email = "updated@org.com",
            phone = "933333333"
        };

        var put = await _client.PutAsJsonAsync(
            $"/api/organizations/{orgId}/representatives/{created!.Id}", updateDto);

        put.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseDto = await put.Content.ReadFromJsonAsync<RepresentativeDto>();
        responseDto!.Email.Should().Be("updated@org.com");
    }

    [Fact]
    public async Task Activate_And_Deactivate_ShouldToggleStatus()
    {
        var orgId = await CreateOrganizationAsync();

        var repDto = new
        {
            name = "Charlie",
            citizenId = "CIDC",
            nationality = "PT",
            email = "charlie@org.com",
            phone = "910333333"
        };

        var post = await _client.PostAsJsonAsync($"/api/organizations/{orgId}/representatives", repDto);
        var created = await post.Content.ReadFromJsonAsync<RepresentativeDto>();

        var activate = await _client.PatchAsync($"/api/organizations/{orgId}/representatives/{created!.Id}/activate", null);
        activate.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var deactivate = await _client.PatchAsync($"/api/organizations/{orgId}/representatives/{created.Id}/deactivate", null);
        deactivate.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Delete_ShouldRemoveRepresentative()
    {
        var orgId = await CreateOrganizationAsync();

        var repDto = new
        {
            name = "Derek",
            citizenId = "CIDD",
            nationality = "PT",
            email = "derek@org.com",
            phone = "910444444"
        };

        var post = await _client.PostAsJsonAsync($"/api/organizations/{orgId}/representatives", repDto);
        var created = await post.Content.ReadFromJsonAsync<RepresentativeDto>();

        var delete = await _client.DeleteAsync(
            $"/api/organizations/{orgId}/representatives/{created!.Id}");
        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var get = await _client.GetAsync($"/api/organizations/{orgId}/representatives/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync() => Task.CompletedTask;
}
}
    