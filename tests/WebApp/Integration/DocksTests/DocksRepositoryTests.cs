using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Integration.DocksTests
{
    public class DocksRepositoryTests
    {
        private static PortManagementContext NewContext()
        {
            var options = new DbContextOptionsBuilder<PortManagementContext>()
                .UseInMemoryDatabase($"DockRepo_{Guid.NewGuid()}")
                .Options;
            return new PortManagementContext(options);
        }

        private static VesselType CreateTestVesselType(string name = "Container Ship", string description = "Large container vessel")
        {
            return VesselType.CreateForUpdate(name, description, 20, 18, 8);
        }

        private static (Dock dock1, Dock dock2, Dock dock3) SeedTestData(PortManagementContext ctx)
        {
            var vesselType1 = CreateTestVesselType("Container Ship", "Large container vessel");
            var vesselType2 = CreateTestVesselType("Tanker", "Oil tanker vessel");
            var vesselType3 = CreateTestVesselType("Bulk Carrier", "Dry bulk cargo vessel");

            ctx.VesselTypes.AddRange(vesselType1, vesselType2, vesselType3);

            var dock1 = new Dock("Main Dock", "North Terminal", 300.0, 15.0, 12.0, new List<VesselType> { vesselType1, vesselType2 });
            var dock2 = new Dock("Secondary Dock", "South Terminal", 250.0, 12.0, 10.0, new List<VesselType> { vesselType2 });
            var dock3 = new Dock("Cargo Dock", "East Terminal", 400.0, 18.0, 15.0, new List<VesselType> { vesselType1, vesselType3 });

            ctx.Docks.AddRange(dock1, dock2, dock3);
            ctx.SaveChanges();

            return (dock1, dock2, dock3);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsEntity_WhenExists()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, _, _) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetByIdAsync(dock1.Id);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(dock1.Id);
            result.Name.Should().Be("Main Dock");
            result.Location.Should().Be("North Terminal");
            result.LengthMeters.Should().Be(300.0);
            result.AllowedVesselTypes.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await repo.GetByIdAsync(nonExistentId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByNameAsync_ReturnsEntity_WhenExists()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, _, _) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetByNameAsync("Main Dock");

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(dock1.Id);
            result.Name.Should().Be("Main Dock");
            result.AllowedVesselTypes.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetByNameAsync_ReturnsNull_WhenNotExists()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetByNameAsync("Non-existent Dock");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByLocationAsync_ReturnsEntity_WhenExists()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, _, _) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetByLocationAsync("North Terminal");

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(dock1.Id);
            result.Location.Should().Be("North Terminal");
        }

        [Fact]
        public async Task GetByLocationAsync_ReturnsNull_WhenNotExists()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetByLocationAsync("Non-existent Terminal");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task AddAsync_PersistsEntity()
        {
            // Arrange
            using var ctx = NewContext();
            var repo = new DockRepository(ctx);
            var vesselType = CreateTestVesselType();
            ctx.VesselTypes.Add(vesselType);
            await ctx.SaveChangesAsync();

            var newDock = new Dock("New Dock", "West Terminal", 200.0, 10.0, 8.0, new List<VesselType> { vesselType });

            // Act
            await repo.AddAsync(newDock);

            // Assert
            var result = await ctx.Docks.Include(d => d.AllowedVesselTypes).FirstOrDefaultAsync(d => d.Id == newDock.Id);
            result.Should().NotBeNull();
            result!.Name.Should().Be("New Dock");
            result.Location.Should().Be("West Terminal");
            result.AllowedVesselTypes.Should().HaveCount(1);
        }

        [Fact]
        public async Task UpdateAsync_PersistsChanges()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, _, _) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            dock1.Name = "Updated Dock Name";
            dock1.Location = "Updated Terminal";
            dock1.UpdateLength(350.0);
            dock1.UpdateDepth(20.0);
            dock1.UpdateMaxDraft(14.0);

            await repo.UpdateAsync(dock1);

            // Assert
            var result = await ctx.Docks.FindAsync(dock1.Id);
            result.Should().NotBeNull();
            result!.Name.Should().Be("Updated Dock Name");
            result.Location.Should().Be("Updated Terminal");
            result.LengthMeters.Should().Be(350.0);
            result.DepthMeters.Should().Be(20.0);
            result.MaxDraftMeters.Should().Be(14.0);
        }

        [Fact]
        public async Task DeleteAsync_RemovesEntity()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            await repo.DeleteAsync(dock1);

            // Assert
            var result = await ctx.Docks.FindAsync(dock1.Id);
            result.Should().BeNull();

            var remainingDocks = await ctx.Docks.ToListAsync();
            remainingDocks.Should().HaveCount(2);
            remainingDocks.Should().Contain(d => d.Id == dock2.Id);
            remainingDocks.Should().Contain(d => d.Id == dock3.Id);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllEntities()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetAllAsync();

            // Assert
            result.Should().HaveCount(3);
            result.Should().Contain(d => d.Id == dock1.Id);
            result.Should().Contain(d => d.Id == dock2.Id);
            result.Should().Contain(d => d.Id == dock3.Id);

            // Verify that vessel types are included
            result.All(d => d.AllowedVesselTypes != null).Should().BeTrue();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoEntities()
        {
            // Arrange
            using var ctx = NewContext();
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchByVesselTypeAsync_ReturnsMatchingDocks()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act - Search for Container Ship (should return dock1 and dock3)
            var result = await repo.SearchByVesselTypeAsync("Container");

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(d => d.Id == dock1.Id);
            result.Should().Contain(d => d.Id == dock3.Id);
            result.Should().NotContain(d => d.Id == dock2.Id);
        }

        [Fact]
        public async Task SearchByVesselTypeAsync_ReturnsEmptyList_WhenNoMatches()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.SearchByVesselTypeAsync("NonExistentType");

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchByLocationAsync_ReturnsMatchingDocks()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act - Search for "Terminal" (should return all docks)
            var result = await repo.SearchByLocationAsync("Terminal");

            // Assert
            result.Should().HaveCount(3);
            result.Should().Contain(d => d.Id == dock1.Id);
            result.Should().Contain(d => d.Id == dock2.Id);
            result.Should().Contain(d => d.Id == dock3.Id);
        }

        [Fact]
        public async Task SearchByLocationAsync_ReturnsPartialMatches()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act - Search for "South" (should return only dock2)
            var result = await repo.SearchByLocationAsync("South");

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(d => d.Id == dock2.Id);
            result.Should().NotContain(d => d.Id == dock1.Id);
            result.Should().NotContain(d => d.Id == dock3.Id);
        }

        [Fact]
        public async Task SearchByLocationAsync_ReturnsEmptyList_WhenNoMatches()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.SearchByLocationAsync("NonExistentLocation");

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchByNameAsync_ReturnsMatchingDocks()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act - Search for "Dock" (should return all docks)
            var result = await repo.SearchByNameAsync("Dock");

            // Assert
            result.Should().HaveCount(3);
            result.Should().Contain(d => d.Id == dock1.Id);
            result.Should().Contain(d => d.Id == dock2.Id);
            result.Should().Contain(d => d.Id == dock3.Id);
        }

        [Fact]
        public async Task SearchByNameAsync_ReturnsPartialMatches()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, dock2, dock3) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act - Search for "Main" (should return only dock1)
            var result = await repo.SearchByNameAsync("Main");

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(d => d.Id == dock1.Id);
            result.Should().NotContain(d => d.Id == dock2.Id);
            result.Should().NotContain(d => d.Id == dock3.Id);
        }

        [Fact]
        public async Task SearchByNameAsync_ReturnsEmptyList_WhenNoMatches()
        {
            // Arrange
            using var ctx = NewContext();
            SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act
            var result = await repo.SearchByNameAsync("NonExistentName");

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task Repository_IncludesVesselTypes_InAllQueries()
        {
            // Arrange
            using var ctx = NewContext();
            var (dock1, _, _) = SeedTestData(ctx);
            var repo = new DockRepository(ctx);

            // Act & Assert - GetByIdAsync includes vessel types
            var byId = await repo.GetByIdAsync(dock1.Id);
            byId!.AllowedVesselTypes.Should().HaveCount(2);
            byId.AllowedVesselTypes.Should().Contain(vt => vt.Name == "Container Ship");
            byId.AllowedVesselTypes.Should().Contain(vt => vt.Name == "Tanker");

            // Act & Assert - GetByNameAsync includes vessel types
            var byName = await repo.GetByNameAsync(dock1.Name);
            byName!.AllowedVesselTypes.Should().HaveCount(2);

            // Act & Assert - GetByLocationAsync includes vessel types
            var byLocation = await repo.GetByLocationAsync(dock1.Location);
            byLocation!.AllowedVesselTypes.Should().HaveCount(2);

            // Act & Assert - SearchByVesselTypeAsync includes vessel types
            var searchByVesselType = await repo.SearchByVesselTypeAsync("Container");
            searchByVesselType.All(d => d.AllowedVesselTypes != null && d.AllowedVesselTypes.Any()).Should().BeTrue();
        }

        [Fact]
        public async Task Repository_HandlesConcurrentOperations()
        {
            // Arrange
            using var ctx = NewContext();
            var repo = new DockRepository(ctx);
            var vesselType = CreateTestVesselType();
            ctx.VesselTypes.Add(vesselType);
            await ctx.SaveChangesAsync();

            // Act - Add multiple docks concurrently
            var dock1 = new Dock("Concurrent Dock 1", "Terminal A", 200.0, 10.0, 8.0, new List<VesselType> { vesselType });
            var dock2 = new Dock("Concurrent Dock 2", "Terminal B", 250.0, 12.0, 9.0, new List<VesselType> { vesselType });

            await Task.WhenAll(
                repo.AddAsync(dock1),
                repo.AddAsync(dock2)
            );

            // Assert
            var allDocks = await repo.GetAllAsync();
            allDocks.Should().HaveCount(2);
            allDocks.Should().Contain(d => d.Name == "Concurrent Dock 1");
            allDocks.Should().Contain(d => d.Name == "Concurrent Dock 2");
        }
    }
}
