using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Models;
using WebApp.Models.Context;
using WebApp.Models.Domain;

namespace PortApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly PortManagementContext _context;

        public ResourcesController(PortManagementContext context)
        {
            _context = context;
        }

        // GET: api/Resources
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceDTO>>> GetResources()
        {
            return await _context.Resources
                .Select(x => ResourceToDTO(x))
                .ToListAsync();
        }

        // GET: api/Resources/5
        // <snippet_GetByID>
        [HttpGet("{id}")]
        public async Task<ActionResult<ResourceDTO>> GetResource(long id)
        {
            var resource = await _context.Resources.FindAsync(id);

            if (resource == null)
            {
                return NotFound();
            }

            return ResourceToDTO(resource);
        }
        // </snippet_GetByID>

        // PUT: api/Resources/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // <snippet_Update>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResource(long id, ResourceDTO resourceDTO)
        {
            if (id != resourceDTO.Id)
            {
                return BadRequest();
            }

            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            resource.Name = resourceDTO.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!ResourceExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }
        // </snippet_Update>

        // POST: api/Resources
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // <snippet_Create>
        [HttpPost]
        public async Task<ActionResult<ResourceDTO>> PostResource(ResourceDTO resourceDTO)
        {
            var resource = new Resource
            {
                Name = resourceDTO.Name
            };

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetResource),
                new { id = resource.Id },
                ResourceToDTO(resource));
        }
        // </snippet_Create>

        // DELETE: api/Resources/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deleteresource(long id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResourceExists(long id)
        {
            return _context.Resources.Any(e => e.Id == id);
        }

        private static ResourceDTO ResourceToDTO(Resource resource) =>
           new ResourceDTO
           {
               Id = resource.Id,
               Name = resource.Name
           };
    }
}