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
            // Validate input
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.DisplayName) || string.IsNullOrWhiteSpace(req.Role))
                return BadRequest("Email, DisplayName, and Role are required.");

            var allowedRoles = WebApp.Security.Roles.All;
            if (!allowedRoles.Contains(req.Role))
                return BadRequest($"Role must be one of: {string.Join(", ", allowedRoles)}");

            try
            {
                // Step 1: Create user in Azure AD with temporary password
                var result = await _graphUserSvc.CreateLocalUserAsync(req);

                // Step 2: Create activation invite record
                var invite = new ActivationInvite
                {
                    Email = req.Email,
                    Role = req.Role,
                    ExpiresUtc = DateTime.UtcNow.AddDays(2),
                    Used = false,
                    TempPassword = result.TempPassword
                };

                _db.ActivationInvites.Add(invite);
                await _db.SaveChangesAsync();

                // Step 3: Generate activation URL
                var frontendBase = _cfg["PublicOrigin"] ?? $"{Request.Scheme}://{Request.Host}";
                var activationUrl = $"{frontendBase}/api/activation/confirm?token={invite.Id}";

                // Step 4: Send email with the temporary password and activation link
                var subject = "Activate your account";
                var body = $@"
                    <p>Hello {req.DisplayName},</p>
                    <p>Your account has been created.</p>
                    <p>Please use the following temporary password to sign in:</p>
                    <p></p>
                    <p><b>{result.TempPassword}</b></p>
                    <p></p>
                    <p>Activate your account here:</p>
                    <p><a href=""{activationUrl}"">{activationUrl}</a></p><p></p>
                    <p>You will be required to set a new password on your first sign-in.</p>";

                await _emailSender.SendEmailAsync(req.Email, subject, body);

                // Step 5: Return success response
                return Ok(new
                {
                    message = "The user has received an email with an activation link.",
                    userId = result.Id,
                    inviteId = invite.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error during user invitation: {Error}", ex.Message);
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }
    }
}
