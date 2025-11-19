using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Security;
using WebApp.Models.Context;
using Microsoft.AspNetCore.Authorization;

namespace WebApp.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize("RequireAdmin")]
    public class UsersAdminController : ControllerBase
    {
        private readonly IGraphUserService _graphUserSvc;
        private readonly PortManagementContext _db;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _cfg;
        private readonly ILogger<UsersAdminController> _logger;

        public UsersAdminController(IGraphUserService graphUserSvc, PortManagementContext db, IEmailSender emailSender, IConfiguration cfg, ILogger<UsersAdminController> logger)
        {
            _graphUserSvc = graphUserSvc;
            _db = db;
            _emailSender = emailSender;
            _cfg = cfg;
            _logger = logger;
        }

        [HttpPost("invite")]
        public async Task<IActionResult> Invite([FromBody] InviteUserRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.DisplayName) ||
                req.Roles == null || req.Roles.Length == 0)
            {
                return BadRequest("Email, DisplayName, and at least one Role are required.");
            }

            var allowedRoles = WebApp.Security.Roles.All; // [Admin, Operator, Officer, Representative]

            if (req.Roles.Any(r => !allowedRoles.Contains(r)))
                return BadRequest($"Roles must be from: {string.Join(", ", allowedRoles)}");

            try
            {
                var result = await _graphUserSvc.CreateLocalUserAsync(req);

                var invite = new ActivationInvite
                {
                    Email = req.Email,
                    // store primary or encoded list – up to you; simplest:
                    Role = string.Join(";", req.Roles),
                    ExpiresUtc = DateTime.UtcNow.AddDays(2),
                    Used = false,
                    TempPassword = result.TempPassword
                };

                _db.ActivationInvites.Add(invite);
                await _db.SaveChangesAsync();

                var frontendBase = _cfg["PublicOrigin"] ?? $"{Request.Scheme}://{Request.Host}";
                var activationUrl = $"{frontendBase}/api/activation/confirm?token={invite.Id}";

                var subject = "Activate your account";
                var body = $@"
            <p>Hello {req.DisplayName},</p>
            <p>Your account has been created.</p>
            <p>Please use the following temporary password to sign in:</p>
            <p><b>{result.TempPassword}</b></p>
            <p>Activate your account here:</p>
            <p><a href=""{activationUrl}"">{activationUrl}</a></p>
            <p>You will be required to set a new password on your first sign-in.</p>";

                await _emailSender.SendEmailAsync(req.Email, subject, body);

                return Ok(new
                {
                    message = "The user has received an email with an activation link.",
                    userId = result.Id,
                    inviteId = invite.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user invitation");
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }


        [HttpPut("{email}/roles")]
        public async Task<IActionResult> UpdateRoles(string email, [FromBody] UpdateUserRolesRequest req)
        {
            var allowedRoles = WebApp.Security.Roles.All;

            if (req.Roles == null || req.Roles.Length == 0)
                return BadRequest("At least one role is required.");

            if (req.Roles.Any(r => !allowedRoles.Contains(r)))
                return BadRequest($"Each role must be one of: {string.Join(", ", allowedRoles)}");

            try
            {
                await _graphUserSvc.UpdateUserRolesAsync(email, req.Roles);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user roles for {Email}", email);
                return StatusCode(500, "An error occurred while updating the roles.");
            }
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<AdminUserDto>> GetUser(string email)
        {
            try
            {
                var user = await _graphUserSvc.GetUserByEmailAsync(email);
                if (user == null) return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user {Email}", email);
                return StatusCode(500, "An error occurred while fetching user info.");
            }
        }


    }
}
