using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StorageAreaController : ControllerBase
    {
        private readonly IStorageAreaService _service;

        public StorageAreaController(IStorageAreaService service)
        {
            _service = service;
        }

        [HttpPost("containerYard")]
        public async Task<IActionResult> AddContainerYard([FromBody] StorageAreaDTO dto, [FromBody] List<int> dockIds)
        {
            try
            {
                // Convert dockIds to Dock objects minimally: repository/service expect ICollection<Dock>
                var docks = dockIds.Select(id => new WebApp.Models.Domain.Docks.Dock(0, 1)).ToList();
                // NOTE: The Dock class currently requires parameters; ideally pass real dock entities.
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
        public async Task<IActionResult> UpdateContainerYard(int id, [FromBody] StorageAreaDTO dto, [FromBody] List<int> dockIds)
        {
            var existing = await _service.GetStorageAreaByIdAsync(id) as ContainerYard;
            if (existing == null) return NotFound();

            try
            {
                var docks = dockIds.Select(i => new WebApp.Models.Domain.Docks.Dock(0, 1)).ToList();
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
        public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] StorageAreaDTO dto, [FromQuery] string specializedCargoType)
        {
            var existing = await _service.GetStorageAreaByIdAsync(id) as Warehouse;
            if (existing == null) return NotFound();

            try
            {
                await _service.UpdateWarehouseAsync(id, dto.Name, dto.MaxCapacityTeu, dto.CurrentOccupancyTeu, specializedCargoType);
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
        public async Task<IActionResult> UpdateConnection(int storageAreaId, int dockId, [FromBody] StorageAreaConnectionDTO dto)
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
        public async Task<IActionResult> DeleteConnection(int storageAreaId, int dockId)
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
