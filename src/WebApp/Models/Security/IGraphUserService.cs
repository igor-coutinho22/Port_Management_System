

namespace WebApp.Models.Security;

public record CreateUserRequest(string Email, string DisplayName, string Password, string Role);

public interface IGraphUserService
{
    Task<CreateUserResult> CreateLocalUserAsync(InviteUserRequest req);
    Task EnableUserAsync(string email);
}

