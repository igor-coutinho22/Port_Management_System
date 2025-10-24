using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;
using WebApp.Models.Application.Services.Qualifications;

public class QualificationServiceTests
{
    private readonly StubQualificationRepository _repo;
    private readonly QualificationService _service;

    public QualificationServiceTests()
    {
        _repo = new StubQualificationRepository();
        _service = new QualificationService(_repo);
    }

    [Fact]
    public async Task RegisterQualificationAsync_ShouldAdd_WhenValid()
    {
        await _service.RegisterQualificationAsync("Q001", "STS Crane Operator");

        var result = await _repo.GetByCodeAsync("Q001");
        result.Should().NotBeNull();
        result!.Name.Should().Be("STS Crane Operator");
    }

    [Fact]
    public async Task RegisterQualificationAsync_ShouldThrow_WhenDuplicateCode()
    {
        var qualification = new Qualification("Q001", "Truck Driver");
        await _repo.AddAsync(qualification);

        var act = async () => await _service.RegisterQualificationAsync("Q001", "STS Crane Operator");

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task RegisterQualificationAsync_ShouldThrow_WhenCodeIsNull()
    {
        var act = async () => await _service.RegisterQualificationAsync(null!, "Some Qualification");
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task RegisterQualificationAsync_ShouldThrow_WhenNameIsEmpty()
    {
        var act = async () => await _service.RegisterQualificationAsync("Q002", "");
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task UpdateQualificationAsync_ShouldModifyName()
    {
        var qualification = new Qualification("Q003", "Truck Driver");
        await _repo.AddAsync(qualification);

        qualification.Name = "Updated Truck Driver";
        await _service.UpdateQualificationAsync(qualification);

        var updated = await _repo.GetByCodeAsync("Q003");
        updated!.Name.Should().Be("Updated Truck Driver");
    }

    [Fact]
    public async Task UpdateQualificationAsync_ShouldThrow_WhenNull()
    {
        var act = async () => await _service.UpdateQualificationAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task UpdateQualificationAsync_ShouldThrow_WhenNotFound()
    {
        var qualification = new Qualification("Q999", "NonExistent");
        var act = async () => await _service.UpdateQualificationAsync(qualification);
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetByCodeAsync_ShouldReturn_CorrectQualification()
    {
        await _repo.AddAsync(new Qualification("Q004", "Crane Operator"));
        var result = await _service.GetByCodeAsync("Q004");
        result.Should().NotBeNull();
        result!.Code.Should().Be("Q004");
    }

    [Fact]
    public async Task GetByNameAsync_ShouldReturn_CorrectQualification()
    {
        await _repo.AddAsync(new Qualification("Q005", "Truck Driver"));
        var result = await _service.GetByNameAsync("Truck Driver");
        result.Should().NotBeNull();
        result!.Name.Should().Be("Truck Driver");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturn_AllQualifications()
    {
        await _repo.AddAsync(new Qualification("Q006", "Crane Operator"));
        await _repo.AddAsync(new Qualification("Q007", "Truck Driver"));

        var list = await _service.GetAllAsync();
        list.Should().HaveCount(2);
    }

    [Fact]
    public async Task Search_ShouldBeCaseInsensitive()
    {
        await _repo.AddAsync(new Qualification("Q008", "Crane Operator"));

        var result = await _service.GetByNameAsync("crane operator");
        result.Should().NotBeNull();
        result!.Code.Should().Be("Q008");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveQualification()
    {
        await _repo.AddAsync(new Qualification("Q009", "Forklift Operator"));

        await _service.DeleteAsync("Q009");

        var result = await _repo.GetByCodeAsync("Q009");
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenNotFound()
    {
        var act = async () => await _service.DeleteAsync("Q404");
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*not found*");
    }

    //
    //
    //
    // NESTED STUB REPOSITORY
    //
    //
    //
    private class StubQualificationRepository : IQualificationRepository
    {
        private readonly Dictionary<string, Qualification> _qualifications = new();

        public Task<Qualification?> GetByCodeAsync(string code)
        {
            _qualifications.TryGetValue(code, out var qualification);
            return Task.FromResult(qualification);
        }

        public Task<Qualification?> GetByNameAsync(string name)
        {
            var qualification = _qualifications.Values.FirstOrDefault(q =>
                q.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(qualification);
        }

        public Task<List<Qualification>> GetAllAsync()
        {
            return Task.FromResult(_qualifications.Values.ToList());
        }

        public Task AddAsync(Qualification qualification)
        {
            if (qualification == null)
                throw new ArgumentNullException(nameof(qualification));
            if (string.IsNullOrWhiteSpace(qualification.Code))
                throw new ArgumentNullException(nameof(qualification.Code));
            if (string.IsNullOrWhiteSpace(qualification.Name))
                throw new ArgumentException("Qualification name cannot be empty.");

            _qualifications[qualification.Code] = qualification;
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Qualification qualification)
        {
            if (qualification == null)
                throw new ArgumentNullException(nameof(qualification));
            if (!_qualifications.ContainsKey(qualification.Code))
                throw new KeyNotFoundException($"Qualification '{qualification.Code}' not found.");

            _qualifications[qualification.Code] = qualification;
            return Task.CompletedTask;
        }

        public Task DeleteAsync(string code)
        {
            if (!_qualifications.Remove(code))
                throw new KeyNotFoundException($"Qualification '{code}' not found.");

            return Task.CompletedTask;
        }
    }
}
