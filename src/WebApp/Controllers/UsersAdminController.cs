
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Context;
using WebApp.Models.Security;
using WebApp.Security;

namespace WebApp.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize]
public sealed class UsersAdminController : ControllerBase
{
    private readonly IGraphUserService _graphUserSvc;

    public UsersAdminController(IGraphUserService graphUserSvc) => _graphUserSvc = graphUserSvc;

    [HttpPost] // create user
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.DisplayName) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            string.IsNullOrWhiteSpace(req.Role))
        {
            return BadRequest("Email, DisplayName, Password and Role are required.");
        }

        var allowed = Roles.All;

        if (!allowed.Contains(req.Role)) return BadRequest($"Role must be one of: {string.Join(", ", allowed)}");

        var id = await _graphUserSvc.CreateLocalUserAsync(req);
        return CreatedAtAction(nameof(GetByEmail), new { email = req.Email }, new { id, email = req.Email });
    }

    [HttpPatch("{email}/role")] // change role
    public async Task<IActionResult> SetRole([FromRoute] string email, [FromBody] string role)
    {

        var allowed = Roles.All;

        if (!allowed.Contains(role)) return BadRequest($"Role must be one of: {string.Join(", ", allowed)}");

        await _graphUserSvc.SetUserRoleAsync(email, role);
        return NoContent();
    }

    [HttpGet("{email}")]
    public IActionResult GetByEmail([FromRoute] string email) => Ok(new { email });

    [HttpPost("invite")]
    public async Task<IActionResult> Invite([FromBody] CreateUserRequest req,
                                           [FromServices] PortManagementContext db,
                                           [FromServices] IEmailSender emailSender,
                                           [FromServices] IConfiguration cfg)
    {
        // validate
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.DisplayName) ||
            string.IsNullOrWhiteSpace(req.Role))
            return BadRequest("Email, DisplayName, and Role are required.");

        var allowed = WebApp.Security.Roles.All;
        if (!allowed.Contains(req.Role)) return BadRequest($"Role must be one of: {string.Join(", ", allowed)}");

        await _graphUserSvc.CreateLocalUserDisabledAsync(req);

        var invite = new ActivationInvite
        {
            Email = req.Email,
            Role = req.Role,
            ExpiresUtc = DateTime.UtcNow.AddDays(2)
        };
        db.ActivationInvites.Add(invite);
        await db.SaveChangesAsync();

        var apiBase = "https://localhost:5179";
        var link = $"{apiBase}/api/activation/confirm?token={invite.Id}";

        var body = $@"
        <p>Hello {req.DisplayName},</p>
        <p>You have been invited to Sines Port Management System. Please confirm your account:</p>
        <p><a href=""{link}"">Activate my account</a></p>
        <p>This link expires on {invite.ExpiresUtc:u}.</p>";

        await emailSender.SendEmailAsync(req.Email, "Activate your Port Management account", body);

        return Accepted(new { email = req.Email });
    }

}