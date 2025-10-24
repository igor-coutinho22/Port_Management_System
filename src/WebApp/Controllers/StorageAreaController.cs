using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StorageAreaController : ControllerBase
    {
        private readonly IStorageAreaService _service;
        private readonly IDockService _dockService;

        public StorageAreaController(IStorageAreaService service, IDockService dockService)
        {
            _service = service;
            _dockService = dockService;
        }

        [HttpPost("containerYard")]
        public async Task<IActionResult> AddContainerYard([FromBody] StorageAreaDTO dto, [FromQuery] List<Guid> dockIds)
        {
            try
            {
                // Retrieve actual dock entities by their IDs in parallel
                var dockTasks = dockIds.Select(id => _dockService.GetByIdAsync(id)).ToList();
                var dockResults = await Task.WhenAll(dockTasks);

                var docks = new List<Dock>();
                for (int i = 0; i < dockResults.Length; i++)
                {
                    if (dockResults[i] == null)
                    {
                        return BadRequest($"Dock with ID {dockIds[i]} not found.");
                    }
                    docks.Add(dockResults[i]!);
                }

                await _service.AddContainerYardAsync(dto.Name, dto.MaxCapacityTeu, dto.CurrentOccupancyTeu, docks);
                return CreatedAtAction(nameof(GetByName), new { name = dto.Name }, dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("warehouse")]
        public async Task<IActionResult> AddWarehouse([FromBody] StorageAreaDTO dto, [FromQuery] string specializedCargoType)
        {
            try
            {
                await _service.AddWarehouseAsync(dto.Name, dto.MaxCapacityTeu, dto.CurrentOccupancyTeu, specializedCargoType);
                return CreatedAtAction(nameof(GetByName), new { name = dto.Name }, dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("containerYard/{id}")]
        public async Task<IActionResult> UpdateContainerYard(int id, [FromBody] ContainerYardDto dto)
        {
            var existing = await _service.GetStorageAreaByIdAsync(id) as ContainerYard;
            if (existing == null) return NotFound();

            try
            {
                // Retrieve actual dock entities by their IDs in parallel
                var dockTasks = dto.DockIds.Select(dockId => _dockService.GetByIdAsync(dockId)).ToList();
                var dockResults = await Task.WhenAll(dockTasks);

                var docks = new List<Dock>();
                for (int i = 0; i < dockResults.Length; i++)
                {
                    if (dockResults[i] == null)
                    {
                        return BadRequest($"Dock with ID {dto.DockIds[i]} not found.");
                    }
                    docks.Add(dockResults[i]!);
                }

                await _service.UpdateContainerYardAsync(id, dto.Name, dto.MaxCapacityTeu, dto.CurrentOccupancyTeu, docks);
                var updated = await _service.GetStorageAreaByIdAsync(id);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("warehouse/{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] WarehouseDto dto)
        {
            var existing = await _service.GetStorageAreaByIdAsync(id) as Warehouse;
            if (existing == null) return NotFound();

            try
            {
                await _service.UpdateWarehouseAsync(id, dto.Name, dto.MaxCapacityTeu, dto.CurrentOccupancyTeu, dto.SpecializedCargoType);
                var updated = await _service.GetStorageAreaByIdAsync(id);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetByName/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var sa = await _service.GetStorageAreaByNameAsync(name);
            if (sa == null) return NotFound();
            return Ok(sa);
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sa = await _service.GetStorageAreaByIdAsync(id);
            if (sa == null) return NotFound();
            return Ok(sa);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllStorageAreasAsync();
            return Ok(list);
        }

        [HttpPost("{storageAreaId}/connections")]
        public async Task<IActionResult> AddConnection(int storageAreaId, [FromBody] StorageAreaConnectionDTO dto)
        {
            try
            {
                await _service.AddConnectionAsync(storageAreaId, dto.DockId, dto.DistanceMeters, dto.TravelSeconds);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{storageAreaId}/connections/{dockId}")]
        public async Task<IActionResult> UpdateConnection(int storageAreaId, Guid dockId, [FromBody] StorageAreaConnectionDTO dto)
        {
            try
            {
                await _service.UpdateConnectionAsync(storageAreaId, dockId, dto.DistanceMeters, dto.TravelSeconds);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{storageAreaId}/connections/{dockId}")]
        public async Task<IActionResult> DeleteConnection(int storageAreaId, Guid dockId)
        {
            var removed = await _service.RemoveConnectionAsync(storageAreaId, dockId);
            if (!removed) return NotFound();
            return NoContent();
        }

        [HttpGet("{storageAreaId}/connections")]
        public async Task<IActionResult> GetConnections(int storageAreaId)
        {
            var list = await _service.GetConnectionsForStorageAreaAsync(storageAreaId);
            return Ok(list);
        }

        [HttpDelete("{storageAreaId}")]
        public async Task<IActionResult> DeleteStorageArea(int storageAreaId)
        {
            try
            {
                await _service.DeleteStorageAreaAsync(storageAreaId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
