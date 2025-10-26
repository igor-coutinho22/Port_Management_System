using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Application.Services;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StorageAreasController : ControllerBase
    {
        private readonly IStorageAreaService _storageAreaService;
        private readonly IDockService _dockService;

        public StorageAreasController(IStorageAreaService service, IDockService dockService)
        {
            _storageAreaService = service;
            _dockService = dockService;
        }

        [HttpPost("containerYard")]
        public async Task<IActionResult> AddContainerYard([FromBody] ContainerYardDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest("Name is required.");

                if (dto.DockIds == null || dto.DockIds.Count == 0)
                    return BadRequest("At least one dock ID is required.");

                // Retrieve actual dock entities by their IDs in parallel
                var dockTasks = dto.DockIds.Select(_dockService.GetByIdAsync).ToList();
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

                var yard = await _storageAreaService.GetStorageAreaByNameAsync(dto.Name) as ContainerYard;
                if (yard != null)
                    return BadRequest($"Container yard with name '{dto.Name}' already exists.");
                
                yard = ContainerYardMapper.MapToDomain(dto, docks);
                await _storageAreaService.AddContainerYardAsync(yard);

                var created = await _storageAreaService.GetStorageAreaByNameAsync(dto.Name);
                var resultDto = StorageAreaMapper.MapToDto(created!);
                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, resultDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("warehouse")]
        public async Task<IActionResult> AddWarehouse([FromBody] WarehouseDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest("Name is required.");

                if (string.IsNullOrWhiteSpace(dto.SpecializedCargoType))
                    return BadRequest("Specialized cargo type is required.");

                var warehouse = await _storageAreaService.GetStorageAreaByNameAsync(dto.Name) as Warehouse;
                if (warehouse != null)
                    return BadRequest($"Warehouse with name '{dto.Name}' already exists.");

                warehouse = WarehouseMapper.MapToDomain(dto);
                await _storageAreaService.AddWarehouseAsync(warehouse);

                var created = await _storageAreaService.GetStorageAreaByNameAsync(dto.Name);
                var resultDto = StorageAreaMapper.MapToDto(created!);
                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, resultDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("containerYard/{id}")]
        public async Task<IActionResult> UpdateContainerYard(int id, [FromBody] ContainerYardDto dto)
        {
            var existing = await _storageAreaService.GetStorageAreaByIdAsync(id) as ContainerYard;
            if (existing == null) 
                return NotFound($"Container yard with ID {id} not found.");

            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest("Name is required.");

                if (dto.DockIds == null || dto.DockIds.Count == 0)
                    return BadRequest("At least one dock ID is required.");

                // Retrieve actual dock entities by their IDs in parallel
                var dockTasks = dto.DockIds.Select(_dockService.GetByIdAsync).ToList();
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

                var updatedYard = ContainerYardMapper.MapToDomain(dto, docks);
                await _storageAreaService.UpdateContainerYardAsync(updatedYard);
                return CreatedAtRoute(nameof(GetById), new { id = updatedYard.Id }, StorageAreaMapper.MapToDto(updatedYard));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("warehouse/{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] WarehouseDto dto)
        {
            var existing = await _storageAreaService.GetStorageAreaByIdAsync(id) as Warehouse;
            if (existing == null) 
                return NotFound($"Warehouse with ID {id} not found.");

            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest("Name is required.");

                if (string.IsNullOrWhiteSpace(dto.SpecializedCargoType))
                    return BadRequest("Specialized cargo type is required.");

                var updatedWarehouse = WarehouseMapper.MapToDomain(dto);
                await _storageAreaService.UpdateWarehouseAsync(updatedWarehouse);
                return CreatedAtRoute(nameof(GetById), new { id = updatedWarehouse.Id }, StorageAreaMapper.MapToDto(updatedWarehouse));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetByName/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var sa = await _storageAreaService.GetStorageAreaByNameAsync(name);
            if (sa == null) 
                return NotFound($"Storage area with name {name} not found.");
            return Ok(sa);
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sa = await _storageAreaService.GetStorageAreaByIdAsync(id);
            if (sa == null) 
                return NotFound($"Storage area with ID {id} not found.");
            return Ok(sa);
        }

        [HttpGet()]
        public async Task<IActionResult> GetAll()
        {
            var list = await _storageAreaService.GetAllStorageAreasAsync();
            return Ok(list);
        }

        [HttpPost("{storageAreaId}/connections")]
        public async Task<IActionResult> AddConnection([FromBody] DockStorageAreaConnectionDTO dto)
        {
            try
            {
                var storageArea = await _storageAreaService.GetStorageAreaByIdAsync(dto.StorageAreaId);
                if (storageArea == null)
                    return NotFound($"Storage area with ID {dto.StorageAreaId} not found.");

                var dock = await _dockService.GetByIdAsync(dto.DockId);
                if (dock == null)
                    return NotFound($"Dock with ID {dto.DockId} not found.");

                var connection = DockStorageAreaConnectionMapper.MapToDomain(dto);
                await _storageAreaService.AddConnectionAsync(connection);

                var created = await _storageAreaService.GetConnectionAsync(dto.StorageAreaId, dto.DockId);
                return CreatedAtAction(nameof(GetConnection), new { storageAreaId = created!.StorageAreaId, dockId = created.DockId }, DockStorageAreaConnectionMapper.MapToDto(created));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{storageAreaId}/connections/{dockId}")]
        public async Task<IActionResult> UpdateConnection(int storageAreaId, Guid dockId, [FromBody] DockStorageAreaConnectionDTO dto)
        {
            try
            {
                var connection = await _storageAreaService.GetConnectionAsync(storageAreaId, dockId);
                if (connection == null)
                    return NotFound($"Connection between storage area ID {storageAreaId} and dock ID {dockId} not found.");

                if (storageAreaId != dto.StorageAreaId || dockId != dto.DockId)
                    return BadRequest("Storage area ID and Dock ID in URL must match those in the body.");

                var updatedConnection = DockStorageAreaConnectionMapper.MapToDomain(dto);
                await _storageAreaService.UpdateConnectionAsync(updatedConnection);
                return CreatedAtRoute(nameof(GetConnection), new { storageAreaId, dockId }, updatedConnection);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{storageAreaId}/connections/{dockId}")]
        public async Task<IActionResult> DeleteConnection(int storageAreaId, Guid dockId)
        {
            try
            {
                await _storageAreaService.RemoveConnectionAsync(storageAreaId, dockId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{storageAreaId}/connection/{dockId}")]
        public async Task<IActionResult> GetConnection(int storageAreaId, Guid dockId)
        {
            var connection = await _storageAreaService.GetConnectionAsync(storageAreaId, dockId);
            if (connection == null)
                return NotFound($"Connection between storage area ID {storageAreaId} and dock ID {dockId} not found.");
            
            return Ok(DockStorageAreaConnectionMapper.MapToDto(connection));
        }

        [HttpGet("{storageAreaId}/connections")]
        public async Task<IActionResult> GetConnections(int storageAreaId)
        {
            var list = await _storageAreaService.GetConnectionsForStorageAreaAsync(storageAreaId);
            return Ok(list);
        }

        [HttpDelete("{storageAreaId}")]
        public async Task<IActionResult> DeleteStorageArea(int storageAreaId)
        {
            try
            {
                await _storageAreaService.DeleteStorageAreaAsync(storageAreaId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
