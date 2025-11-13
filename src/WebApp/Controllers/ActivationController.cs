using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Context;
using WebApp.Models.Security;

[ApiController]
[Route("api/activation")]
public sealed class ActivationController : ControllerBase
{
    private readonly PortManagementContext _db;
    private readonly IGraphUserService _graph;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _cfg;

    public ActivationController(PortManagementContext db, IGraphUserService graph, IEmailSender emailSender, IConfiguration cfg)
    {
        _db = db;
        _graph = graph;
        _emailSender = emailSender;
        _cfg = cfg;
    }

    // GET /api/activation/confirm?token=GUID
    [HttpGet("confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> Confirm([FromQuery] Guid token)
    {
        var invite = await _db.ActivationInvites.FindAsync(token);
        if (invite is null || invite.Used || invite.ExpiresUtc < DateTime.UtcNow)
            return BadRequest("Invalid or expired activation link.");

        await _graph.EnableUserAsync(invite.Email);

        invite.Used = true;
        await _db.SaveChangesAsync();

        // Redirect to your styled success page (no password in URL)
        var successUrl = $"/index.html?token={token}#activation-success";
        return Redirect(successUrl);
    }

    [HttpGet("getTempPassword")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTempPassword([FromQuery] Guid token)
    {
        var invite = await _db.ActivationInvites.FindAsync(token);
        if (invite == null || invite.ExpiresUtc < DateTime.UtcNow)
        {
            return BadRequest("Invalid or expired activation link.");
        }

        return Ok(new { password = invite.TempPassword });
    }


}
