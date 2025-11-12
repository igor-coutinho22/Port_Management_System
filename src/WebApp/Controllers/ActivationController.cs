using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Context;
using WebApp.Models.Security;

namespace WebApp.Controllers;

[ApiController]
[Route("api/activation")]
public sealed class ActivationController : ControllerBase
{
    private readonly PortManagementContext _db;
    private readonly IGraphUserService _graph;
    private readonly IConfiguration _cfg;

    public ActivationController(PortManagementContext db, IGraphUserService graph, IConfiguration cfg)
    {
        _db = db; _graph = graph; _cfg = cfg;
    }

    // GET /api/activation/confirm?token=GUID
    [HttpGet("confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> Confirm([FromQuery] Guid token)
    {
        var invite = await _db.ActivationInvites.FindAsync(token);
        if (invite is null || invite.Used || invite.ExpiresUtc < DateTime.UtcNow)
            return BadRequest("Invalid or expired activation link.");

        // Enable the CIAM user
        await _graph.EnableUserAsync(invite.Email);

        invite.Used = true;
        await _db.SaveChangesAsync();

        // Generate and set temporary password (for the frontend)
        var tempPassword = await _graph.SetTemporaryPasswordAsync(invite.Email);

        var successUrl = Uri.EscapeDataString($"https://localhost:5179/activation-success?password={tempPassword}");

        return Redirect(successUrl);
    }


}
