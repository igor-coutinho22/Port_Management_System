using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;
using WebApp.Models.Application.Services.Qualifications;
using Xunit;

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
        private readonly List<Qualification> _qualifications = new();

        public Qualification? GetByCode(string code) => _qualifications.FirstOrDefault(q => q.Code == code);
        public Task<Qualification?> GetByCodeAsync(string code) => Task.FromResult(GetByCode(code));
        public Qualification? GetByName(string name) => _qualifications.FirstOrDefault(q => q.Name == name);
        public Task<Qualification?> GetByNameAsync(string name) => Task.FromResult(GetByName(name));
        public List<Qualification> GetAll() => _qualifications.ToList();
        public Task<List<Qualification>> GetAllAsync() => Task.FromResult(GetAll());
        public void Add(Qualification q) => _qualifications.Add(q);
        public Task AddAsync(Qualification q) { _qualifications.Add(q); return Task.CompletedTask; }
        public void Update(Qualification q) { /* stub */ }
        public Task UpdateAsync(Qualification q) => Task.CompletedTask;
        public void Delete(string code) => _qualifications.RemoveAll(q => q.Code == code);
        public Task DeleteAsync(string code) { Delete(code); return Task.CompletedTask; }
        public Task DeleteAsync(Qualification q) { Delete(q.Code); return Task.CompletedTask; }

    }
}
