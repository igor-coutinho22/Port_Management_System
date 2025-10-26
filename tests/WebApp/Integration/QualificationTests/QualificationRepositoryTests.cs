using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Infrastructure.Repositories.Qualifications;
using FluentAssertions;
using Xunit;
using System.Threading.Tasks;

public class QualificationRepositoryTests
{
    private readonly PortManagementContext _context;
    private readonly QualificationRepository _repository;

    public QualificationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<PortManagementContext>()
            .UseInMemoryDatabase(databaseName: "QualificationTestDB")
            .Options;

        _context = new PortManagementContext(options);
        _repository = new QualificationRepository(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistQualification()
    {
        var qualification = new Qualification("Q001", "STS Crane Operator");
        await _repository.AddAsync(qualification);

        var result = await _repository.GetByCodeAsync("Q001");
        result.Should().NotBeNull();
        result!.Name.Should().Be("STS Crane Operator");
    }

    [Fact]
    public async Task UpdateAsync_ShouldChangeQualificationName()
    {
        var qualification = new Qualification("Q002", "Truck Driver");
        await _repository.AddAsync(qualification);

        qualification.Name = "Updated Truck Driver";
        await _repository.UpdateAsync(qualification);

        var updated = await _repository.GetByCodeAsync("Q002");
        updated!.Name.Should().Be("Updated Truck Driver");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveQualification()
    {
        var qualification = new Qualification("Q003", "Forklift Operator");
        await _repository.AddAsync(qualification);

        await _repository.DeleteAsync("Q003");

        var result = await _repository.GetByCodeAsync("Q003");
        result.Should().BeNull();
    }
}
