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

[Collection("WebApp Factory Collection")]
public class QualificationControllerTests : IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly List<string> _createdQualificationCodes = new();
    private readonly string _testRunId;

    public QualificationControllerTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _testRunId = Guid.NewGuid().ToString("N")[..8];
    }

    private async Task<string> CreateQualificationWithCleanupAsync(string code, string name)
    {
        var dto = new QualificationDTO
        {
            Code = code,
            Name = name
        };

        var response = await _client.PostAsJsonAsync("/api/qualifications", dto);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        _createdQualificationCodes.Add(code);
        return code;
    }

    [Fact]
    public async Task PostQualification_ShouldCreateQualification()
    {
        var code = await CreateQualificationWithCleanupAsync($"Q100{_testRunId}", "STS Crane Operator");

        var response = await _client.GetAsync($"/api/qualifications/{code}");
        response.EnsureSuccessStatusCode();

        var qualification = await response.Content.ReadFromJsonAsync<QualificationDTO>();
        qualification!.Name.Should().Be("STS Crane Operator");
    }

    [Fact]
    public async Task PutQualification_ShouldUpdateName()
    {
        // Create the qualifications we'll be updating
        var code1 = await CreateQualificationWithCleanupAsync($"Q3{_testRunId}", "Original Hazardous Cargo Handling");
        var code2 = await CreateQualificationWithCleanupAsync($"Q200{_testRunId}", "Original STS Crane Operator");

        // Update code1
        var dto = new QualificationDTO
        {
            Code = code1,
            Name = "Updated Hazardous Cargo Handling"
        };

        var response = await _client.PutAsJsonAsync($"/api/qualifications/{code1}", dto);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Update code2 with different data
        dto.Code = code2;
        dto.Name = "Updated STS Crane Operator";
        await _client.PutAsJsonAsync($"/api/qualifications/{code2}", dto);
    }

    Task IAsyncLifetime.InitializeAsync() => Task.CompletedTask;

    async Task IAsyncLifetime.DisposeAsync()
    {
        foreach (var code in _createdQualificationCodes)
        {
            try
            {
                await _client.DeleteAsync($"/api/qualifications/{code}");
            }
            catch { }
        }
        _createdQualificationCodes.Clear();
    }
    
}