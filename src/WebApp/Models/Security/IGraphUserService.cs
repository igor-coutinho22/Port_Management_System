

namespace WebApp.Models.Security;

public record CreateUserRequest(string Email, string DisplayName, string Password, string Role);

public interface IGraphUserService
{
    Task<CreateUserResult> CreateLocalUserAsync(InviteUserRequest req);
    Task EnableUserAsync(string email);
    Task UpdateUserRolesAsync(string email, IEnumerable<string> roles);
    Task<AdminUserDto?> GetUserByEmailAsync(string email);

}

