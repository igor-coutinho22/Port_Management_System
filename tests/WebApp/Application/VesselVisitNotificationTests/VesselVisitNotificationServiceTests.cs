using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Infrastructure.Repositories;
using Xunit;

public class VesselVisitNotificationServiceTests
{
    private readonly StubVesselVisitNotificationRepository _repo;
    private readonly VesselVisitNotificationService _service;

    public VesselVisitNotificationServiceTests()
    {
        _repo = new StubVesselVisitNotificationRepository();
        _service = new VesselVisitNotificationService(_repo);
    }

    [Fact]
    public async Task CreateAsync_ShouldAddVesselVisitNotification()
    {
        var vvn = new VesselVisitNotification(
            vesselId: Guid.NewGuid(),
            dockId: Guid.NewGuid(),
            visitDate: DateTime.UtcNow,
            purpose: VisitPurpose.Maintenance);

        var created = await _service.CreateAsync(VesselVisitNotificationMapper.ToDTO(vvn));

        created.Should().NotBeNull();
        (await _repo.GetByIdAsync(created.Id)).Should().NotBeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllVisits()
    {
        var vvn1 = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);
        var vvn2 = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddDays(1), VisitPurpose.Commercial);

        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn1));
        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn2));

        var result = await _service.GetAllAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnExistingNotification()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);
        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn));

        var result = await _service.GetByIdAsync(vvn.Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(vvn.Id);
    }

    [Fact]
    public async Task SubmitAsync_ShouldChangeStatus_WhenValid()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Maintenance);
        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn));

        await _service.SubmitAsync(vvn.Id);

        var updated = await _repo.GetByIdAsync(vvn.Id);
        updated!.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    [Fact]
    public async Task SubmitAsync_ShouldThrow_WhenNotFound()
    {
        var act = async () => await _service.SubmitAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task SubmitAsync_ShouldThrow_ForCommercialVisitWithoutManifest()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn));

        var act = async () => await _service.SubmitAsync(vvn.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Commercial visits must have at least one cargo manifest*");
    }

    [Fact]
    public async Task SubmitAsync_ShouldSucceed_ForCommercialVisitWithManifest()
    {
        var vvn = new VesselVisitNotification(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow, VisitPurpose.Commercial);
        vvn.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));
        await _repo.AddAsync(VesselVisitNotificationMapper.ToDTO(vvn));

        await _service.SubmitAsync(vvn.Id);

        var result = await _repo.GetByIdAsync(vvn.Id);
        result!.Status.Should().Be(VesselVisitStatus.Submitted);
    }

    //
    // === Stub Repository (In-Memory) ===
    //

    private sealed class StubVesselVisitNotificationRepository : IVesselVisitNotificationRepository
    {
        private readonly Dictionary<Guid, VesselVisitNotificationDTO> _store = new();

        public Task AddAsync(VesselVisitNotification entity)
        {
            var dto = VesselVisitNotificationMapper.ToDTO(entity);
            _store[dto.Id] = dto;
            return Task.CompletedTask;
        }

        public Task AddAsync(VesselVisitNotificationDTO dto)
        {
            _store[dto.Id] = dto;
            return Task.CompletedTask;
        }

        public Task UpdateAsync(VesselVisitNotification entity)
        {
            var dto = VesselVisitNotificationMapper.ToDTO(entity);
            _store[dto.Id] = dto;
            return Task.CompletedTask;
        }

        public Task UpdateAsync(VesselVisitNotificationDTO dto)
        {
            _store[dto.Id] = dto;
            return Task.CompletedTask;
        }

        public Task<VesselVisitNotification?> GetByIdAsync(Guid id)
        {
            if (_store.TryGetValue(id, out var dto))
                return Task.FromResult<VesselVisitNotification?>(VesselVisitNotificationMapper.ToEntity(dto));

            return Task.FromResult<VesselVisitNotification?>(null);
        }

        public Task<IEnumerable<VesselVisitNotification>> GetAllAsync()
        {
            IEnumerable<VesselVisitNotification> entities =
                _store.Values.Select(VesselVisitNotificationMapper.ToEntity);
            return Task.FromResult(entities);
        }
    }

}
