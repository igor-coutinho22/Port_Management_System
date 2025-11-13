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
                if (string.IsNullOrWhiteSpace(dto.StorageArea!.Name))
                    return BadRequest("Name is required.");

                if (dto.DockIds == null || dto.DockIds.Count == 0)
                    return BadRequest("At least one dock ID is required.");

                // Retrieve actual dock entities by their IDs sequentially to avoid DbContext concurrency issues
                var docks = new List<Dock>();
                foreach (var dockId in dto.DockIds)
                {
                    var dock = await _dockService.GetByIdAsync(dockId);
                    if (dock == null)
                    {
                        return BadRequest($"Dock with ID {dockId} not found.");
                    }
                    docks.Add(dock);
                }

                var yard = await _storageAreaService.GetStorageAreaByNameAsync(dto.StorageArea!.Name) as ContainerYard;
                if (yard != null)
                    return BadRequest($"Container yard with name '{dto.StorageArea!.Name}' already exists.");
                
                yard = ContainerYardMapper.MapToDomain(dto, docks);
                await _storageAreaService.AddContainerYardAsync(yard);

                var created = await _storageAreaService.GetStorageAreaByNameAsync(dto.StorageArea!.Name) as ContainerYard;
                var resultDto = ContainerYardMapper.MapToDto(created!);
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
                if (string.IsNullOrWhiteSpace(dto.StorageArea!.Name))
                    return BadRequest("Name is required.");

                if (string.IsNullOrWhiteSpace(dto.SpecializedCargoType))
                    return BadRequest("Specialized cargo type is required.");

                var warehouse = await _storageAreaService.GetStorageAreaByNameAsync(dto.StorageArea!.Name) as Warehouse;
                if (warehouse != null)
                    return BadRequest($"Warehouse with name '{dto.StorageArea!.Name}' already exists.");

                warehouse = WarehouseMapper.MapToDomain(dto);
                await _storageAreaService.AddWarehouseAsync(warehouse);

                var created = await _storageAreaService.GetStorageAreaByNameAsync(dto.StorageArea!.Name);
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
                if (string.IsNullOrWhiteSpace(dto.StorageArea!.Name))
                    return BadRequest("Name is required.");

                if (dto.DockIds == null || dto.DockIds.Count == 0)
                    return BadRequest("At least one dock ID is required.");

                // Retrieve actual dock entities by their IDs sequentially to avoid DbContext concurrency issues
                var docks = new List<Dock>();
                foreach (var dockId in dto.DockIds)
                {
                    var dock = await _dockService.GetByIdAsync(dockId);
                    if (dock == null)
                    {
                        return BadRequest($"Dock with ID {dockId} not found.");
                    }
                    docks.Add(dock);
                }

                var updatedYard = ContainerYardMapper.MapToDomainForUpdate(id, dto, docks);
                await _storageAreaService.UpdateContainerYardAsync(updatedYard);
                return Ok(StorageAreaMapper.MapToDto(updatedYard));
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
                if (string.IsNullOrWhiteSpace(dto.StorageArea!.Name))
                    return BadRequest("Name is required.");

                if (string.IsNullOrWhiteSpace(dto.SpecializedCargoType))
                    return BadRequest("Specialized cargo type is required.");

                var updatedWarehouse = WarehouseMapper.MapToDomainForUpdate(id, dto);
                await _storageAreaService.UpdateWarehouseAsync(updatedWarehouse);
                return Ok(StorageAreaMapper.MapToDto(updatedWarehouse));
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
            var dtoList = list.Select(sa => 
            {
                if (sa is ContainerYard yard)
                    return (object)ContainerYardMapper.MapToDto(yard);
                else if (sa is Warehouse warehouse)
                    return (object)WarehouseMapper.MapToDto(warehouse);
                else
                    return (object)StorageAreaMapper.MapToDto(sa);
            }).ToList();
            return Ok(dtoList);
        }

        [HttpPost("{storageAreaId}/connections")]
        public async Task<IActionResult> AddConnection(int storageAreaId, [FromBody] DockStorageAreaConnectionDTO dto)
        {
            try
            {
                // Use the storageAreaId from the URL route parameter
                var storageArea = await _storageAreaService.GetStorageAreaByIdAsync(storageAreaId);
                if (storageArea == null)
                    return NotFound($"Storage area with ID {storageAreaId} not found.");

                // Only ContainerYards can have dock connections
                if (!(storageArea is ContainerYard))
                    return BadRequest($"Storage area with ID {storageAreaId} is not a Container Yard. Only Container Yards can have dock connections.");

                var dock = await _dockService.GetByIdAsync(dto.DockId);
                if (dock == null)
                    return NotFound($"Dock with ID {dto.DockId} not found.");

                // Use the new mapper method that takes the DTO and storageAreaId from route parameter
                var connection = DockStorageAreaConnectionMapper.MapToDomain(dto, storageAreaId);
                await _storageAreaService.AddConnectionAsync(connection);

                var created = await _storageAreaService.GetConnectionAsync(storageAreaId, dto.DockId);
                return CreatedAtAction(nameof(GetConnection), new { storageAreaId, dockId = dto.DockId }, DockStorageAreaConnectionMapper.MapToDto(created!));
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
                // Validate that the storage area is a ContainerYard
                var storageArea = await _storageAreaService.GetStorageAreaByIdAsync(storageAreaId);
                if (storageArea == null)
                    return NotFound($"Storage area with ID {storageAreaId} not found.");
                
                if (!(storageArea is ContainerYard))
                    return BadRequest($"Storage area with ID {storageAreaId} is not a Container Yard. Only Container Yards can have dock connections.");

                var connection = await _storageAreaService.GetConnectionAsync(storageAreaId, dockId);
                if (connection == null)
                    return NotFound($"Connection between storage area ID {storageAreaId} and dock ID {dockId} not found.");

                if (dockId != dto.DockId)
                    return BadRequest("Dock ID in URL must match the one in the body.");

                var updatedConnection = await _storageAreaService.UpdateConnectionFromDtoAsync(storageAreaId, dockId, dto);
                return Ok(DockStorageAreaConnectionMapper.MapToDto(updatedConnection));
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
                // Validate that the storage area is a ContainerYard
                var storageArea = await _storageAreaService.GetStorageAreaByIdAsync(storageAreaId);
                if (storageArea == null)
                    return NotFound($"Storage area with ID {storageAreaId} not found.");
                
                if (!(storageArea is ContainerYard))
                    return BadRequest($"Storage area with ID {storageAreaId} is not a Container Yard. Only Container Yards can have dock connections.");

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
            // Validate that the storage area exists and is a ContainerYard
            var storageArea = await _storageAreaService.GetStorageAreaByIdAsync(storageAreaId);
            if (storageArea == null)
                return NotFound($"Storage area with ID {storageAreaId} not found.");
            
            if (!(storageArea is ContainerYard))
                return BadRequest($"Storage area with ID {storageAreaId} is not a Container Yard. Only Container Yards can have dock connections.");

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
