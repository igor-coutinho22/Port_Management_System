using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using WebApp;
using WebApp.Models.Application.DTOs;

public class QualificationControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public QualificationControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostQualification_ShouldCreateQualification()
    {
        var dto = new QualificationDTO
        {
            Code = "Q100",
            Name = "STS Crane Operator"
        };

        var response = await _client.PostAsJsonAsync("/api/qualifications", dto);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetQualification_ShouldReturnCreatedQualification()
    {
        var response = await _client.GetAsync("/api/qualifications/Q100");
        response.EnsureSuccessStatusCode();

        var qualification = await response.Content.ReadFromJsonAsync<QualificationDTO>();
        qualification!.Name.Should().Be("STS Crane Operator");
    }

    [Fact]
    public async Task PutQualification_ShouldUpdateName()
    {
        var dto = new QualificationDTO
        {
            Code = "Q100",
            Name = "Updated Crane Operator"
        };

        var response = await _client.PutAsJsonAsync("/api/qualifications/Q100", dto);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteQualification_ShouldReturnNoContent()
    {
        var response = await _client.DeleteAsync("/api/qualifications/Q100");
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task GetAllQualifications_ShouldReturnList()
    {
        var response = await _client.GetAsync("/api/qualifications");
        response.EnsureSuccessStatusCode();

        var list = await response.Content.ReadFromJsonAsync<List<QualificationDTO>>();
        list.Should().NotBeNull();
    }
}
