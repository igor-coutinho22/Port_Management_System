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

public class QualificationControllerTests : IClassFixture<TestWebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;

    public QualificationControllerTests(TestWebAppFactory factory)
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

        response = await _client.GetAsync("/api/qualifications/Q100");
        response.EnsureSuccessStatusCode();

        var qualification = await response.Content.ReadFromJsonAsync<QualificationDTO>();
        qualification!.Name.Should().Be("STS Crane Operator");
    }

    [Fact]
    public async Task PutQualification_ShouldUpdateName()
    {
        var dto = new QualificationDTO
        {
            Code = "Q3",
            Name = "Updated Hazardous Cargo Handling"
        };

        var response = await _client.PutAsJsonAsync("/api/qualifications/Q3", dto);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        dto.Name = "Hazardous Cargo Handling";
        await _client.PutAsJsonAsync("/api/qualifications/Q100", dto);
    }

    public async Task InitializeAsync()
    {
    }

    public async Task DisposeAsync()
    {
    
        await _client.DeleteAsync("/api/qualifications/Q100");
    
    }
    
}
