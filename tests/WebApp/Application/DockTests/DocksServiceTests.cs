using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

namespace WebApp.Tests.Application.DockTests
{
    public class DocksServiceTests
    {
        private readonly StubDockRepository _dockRepository;
        private readonly DockService _service;

        public DocksServiceTests()
        {
            _dockRepository = new StubDockRepository();
            _service = new DockService(_dockRepository);
        }

        private static List<VesselType> CreateTestVesselTypes()
        {
            return new List<VesselType>
            {
                VesselType.CreateForUpdate("Container Ship", "Large container vessel", 20, 18, 8),
                VesselType.CreateForUpdate("Bulk Carrier", "Dry bulk vessel", 15, 12, 6)
            };
        }

        private static Dock CreateTestDock(string name = "Main Dock", string location = "Pier 1")
        {
            var vesselTypes = CreateTestVesselTypes();
            return new Dock(name, location, 100, 50, 15, vesselTypes);
        }

        [Fact]
        public async Task CreateAsync_ShouldCreate_WhenValidDock()
        {
            // Arrange
            var dock = CreateTestDock();

            // Act
            await _service.CreateAsync(dock);

            // Assert
            var createdDock = await _dockRepository.GetByIdAsync(dock.Id);
            createdDock.Should().NotBeNull();
            createdDock!.Name.Should().Be("Main Dock");
            createdDock.Location.Should().Be("Pier 1");
            createdDock.LengthMeters.Should().Be(100);
            createdDock.DepthMeters.Should().Be(50);
            createdDock.MaxDraftMeters.Should().Be(15);
            createdDock.AllowedVesselTypes.Should().HaveCount(2);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDockIsNull()
        {
            // Act & Assert
            var act = async () => await _service.CreateAsync(null!);
            await act.Should().ThrowAsync<ArgumentNullException>();
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDuplicateName()
        {
            // Arrange
            var dock1 = CreateTestDock("Port Alpha", "Location A");
            var dock2 = CreateTestDock("Port Alpha", "Location B");
            await _dockRepository.AddAsync(dock1);

            // Act & Assert
            var act = async () => await _service.CreateAsync(dock2);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*dock with the name 'Port Alpha' already exists*");
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDuplicateLocation()
        {
            // Arrange
            var dock1 = CreateTestDock("Port Alpha", "Pier 5");
            var dock2 = CreateTestDock("Port Beta", "Pier 5");
            await _dockRepository.AddAsync(dock1);

            // Act & Assert
            var act = async () => await _service.CreateAsync(dock2);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*dock at location 'Pier 5' already exists*");
        }

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDuplicateId()
        {
            // Arrange
            var dock1 = CreateTestDock("Port Alpha", "Location A");
            var dock2 = CreateTestDock("Port Beta", "Location B");
            
            // Force same ID
            var field = typeof(Dock).GetField("<Id>k__BackingField", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            field!.SetValue(dock2, dock1.Id);
            
            await _dockRepository.AddAsync(dock1);

            // Act & Assert
            var act = async () => await _service.CreateAsync(dock2);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage($"*dock with ID '{dock1.Id}' already exists*");
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturn_WhenExists()
        {
            // Arrange
            var dock = CreateTestDock();
            await _dockRepository.AddAsync(dock);

            // Act
            var result = await _service.GetByIdAsync(dock.Id);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(dock.Id);
            result.Name.Should().Be("Main Dock");
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
        {
            // Act
            var result = await _service.GetByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByNameAsync_ShouldReturn_WhenExists()
        {
            // Arrange
            var dock = CreateTestDock("Special Dock", "Special Location");
            await _dockRepository.AddAsync(dock);

            // Act
            var result = await _service.GetByNameAsync("Special Dock");

            // Assert
            result.Should().NotBeNull();
            result!.Name.Should().Be("Special Dock");
            result.Location.Should().Be("Special Location");
        }

        [Fact]
        public async Task GetByNameAsync_ShouldReturnNull_WhenNotExists()
        {
            // Act
            var result = await _service.GetByNameAsync("Nonexistent Dock");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByLocationAsync_ShouldReturn_WhenExists()
        {
            // Arrange
            var dock = CreateTestDock("Test Dock", "Unique Location");
            await _dockRepository.AddAsync(dock);

            // Act
            var result = await _service.GetByLocationAsync("Unique Location");

            // Assert
            result.Should().NotBeNull();
            result!.Location.Should().Be("Unique Location");
            result.Name.Should().Be("Test Dock");
        }

        [Fact]
        public async Task GetByLocationAsync_ShouldReturnNull_WhenNotExists()
        {
            // Act
            var result = await _service.GetByLocationAsync("Nonexistent Location");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdate_WhenExists()
        {
            // Arrange
            var originalDock = CreateTestDock("Original", "Original Location");
            await _dockRepository.AddAsync(originalDock);

            var newVesselTypes = new List<VesselType>
            {
                VesselType.CreateForUpdate("Tanker", "Oil tanker", 10, 8, 4)
            };
            var updatedDock = new Dock("Updated Name", "Updated Location", 150, 60, 20, newVesselTypes);
            
            // Force same ID for update
            var field = typeof(Dock).GetField("<Id>k__BackingField", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            field!.SetValue(updatedDock, originalDock.Id);

            // Act
            await _service.UpdateAsync(updatedDock);

            // Assert
            var result = await _dockRepository.GetByIdAsync(originalDock.Id);
            result.Should().NotBeNull();
            result!.Name.Should().Be("Updated Name");
            result.Location.Should().Be("Updated Location");
            result.LengthMeters.Should().Be(150);
            result.DepthMeters.Should().Be(60);
            result.MaxDraftMeters.Should().Be(20);
            result.AllowedVesselTypes.Should().HaveCount(1);
            result.AllowedVesselTypes.First().Name.Should().Be("Tanker");
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenDockNotFound()
        {
            // Arrange
            var nonExistentDock = CreateTestDock();

            // Act & Assert
            var act = async () => await _service.UpdateAsync(nonExistentDock);
            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("*Dock not found*");
        }

        [Fact]
        public async Task DeleteAsync_ShouldDelete_WhenExists()
        {
            // Arrange
            var dock = CreateTestDock();
            await _dockRepository.AddAsync(dock);

            // Act
            await _service.DeleteAsync(dock.Id);

            // Assert
            var result = await _dockRepository.GetByIdAsync(dock.Id);
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenNotExists()
        {
            // Act & Assert
            var act = async () => await _service.DeleteAsync(Guid.NewGuid());
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*Dock not found*");
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAll_Docks()
        {
            // Arrange
            var dock1 = CreateTestDock("Dock 1", "Location 1");
            var dock2 = CreateTestDock("Dock 2", "Location 2");
            await _dockRepository.AddAsync(dock1);
            await _dockRepository.AddAsync(dock2);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(d => d.Name == "Dock 1");
            result.Should().Contain(d => d.Name == "Dock 2");
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnEmpty_WhenNoDocks()
        {
            // Act
            var result = await _service.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchByVesselTypeAsync_ShouldReturnMatching_Docks()
        {
            // Arrange
            var containerVesselTypes = new List<VesselType>
            {
                VesselType.CreateForUpdate("Container Ship", "Container vessel", 20, 18, 8)
            };
            var bulkVesselTypes = new List<VesselType>
            {
                VesselType.CreateForUpdate("Bulk Carrier", "Bulk vessel", 15, 12, 6)
            };

            var dock1 = new Dock("Container Dock", "Pier A", 100, 50, 15, containerVesselTypes);
            var dock2 = new Dock("Bulk Dock", "Pier B", 120, 45, 12, bulkVesselTypes);
            
            await _dockRepository.AddAsync(dock1);
            await _dockRepository.AddAsync(dock2);

            // Act
            var result = await _service.SearchByVesselTypeAsync("Container");

            // Assert
            result.Should().HaveCount(1);
            result.First().Name.Should().Be("Container Dock");
        }

        [Fact]
        public async Task SearchByLocationAsync_ShouldReturnMatching_Docks()
        {
            // Arrange
            var dock1 = CreateTestDock("North Dock", "North Terminal");
            var dock2 = CreateTestDock("South Dock", "South Terminal");
            var dock3 = CreateTestDock("East Dock", "Eastern Port");
            
            await _dockRepository.AddAsync(dock1);
            await _dockRepository.AddAsync(dock2);
            await _dockRepository.AddAsync(dock3);

            // Act
            var result = await _service.SearchByLocationAsync("Terminal");

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(d => d.Name == "North Dock");
            result.Should().Contain(d => d.Name == "South Dock");
        }

        [Fact]
        public async Task SearchByNameAsync_ShouldReturnMatching_Docks()
        {
            // Arrange
            var dock1 = CreateTestDock("Alpha Port", "Location A");
            var dock2 = CreateTestDock("Beta Port", "Location B");
            var dock3 = CreateTestDock("Gamma Terminal", "Location C");
            
            await _dockRepository.AddAsync(dock1);
            await _dockRepository.AddAsync(dock2);
            await _dockRepository.AddAsync(dock3);

            // Act
            var result = await _service.SearchByNameAsync("Port");

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(d => d.Name == "Alpha Port");
            result.Should().Contain(d => d.Name == "Beta Port");
        }

        // Nested Stub Repository for testing
        private class StubDockRepository : IDockRepository
        {
            private readonly List<Dock> _docks = new();

            public Task<Dock?> GetByIdAsync(Guid id)
            {
                var dock = _docks.FirstOrDefault(d => d.Id == id);
                return Task.FromResult(dock);
            }

            public Task<Dock?> GetByNameAsync(string name)
            {
                var dock = _docks.FirstOrDefault(d => d.Name == name);
                return Task.FromResult(dock);
            }

            public Task<Dock?> GetByLocationAsync(string location)
            {
                var dock = _docks.FirstOrDefault(d => d.Location == location);
                return Task.FromResult(dock);
            }

            public Task<List<Dock>> SearchByVesselTypeAsync(string vesselTypeName)
            {
                var docks = _docks.Where(d => 
                    d.AllowedVesselTypes.Any(vt => vt.Name.Contains(vesselTypeName))).ToList();
                return Task.FromResult(docks);
            }

            public Task<List<Dock>> SearchByLocationAsync(string location)
            {
                var docks = _docks.Where(d => d.Location.Contains(location)).ToList();
                return Task.FromResult(docks);
            }

            public Task<List<Dock>> SearchByNameAsync(string name)
            {
                var docks = _docks.Where(d => d.Name.Contains(name)).ToList();
                return Task.FromResult(docks);
            }

            public Task<List<Dock>> GetAllAsync()
            {
                return Task.FromResult(_docks.ToList());
            }

            public Task AddAsync(Dock dock)
            {
                _docks.Add(dock);
                return Task.CompletedTask;
            }

            public Task UpdateAsync(Dock dock)
            {
                var existing = _docks.FirstOrDefault(d => d.Id == dock.Id);
                if (existing != null)
                {
                    _docks.Remove(existing);
                    _docks.Add(dock);
                }
                return Task.CompletedTask;
            }

            public Task DeleteAsync(Dock dock)
            {
                _docks.Remove(dock);
                return Task.CompletedTask;
            }
        }
    }
}
