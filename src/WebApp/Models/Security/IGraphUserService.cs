using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace WebApp.Models.Security;

public record CreateUserRequest(string Email, string DisplayName, string Password, string Role);

public interface IGraphUserService
{
    Task<string> CreateLocalUserAsync(CreateUserRequest req);
    Task SetUserRoleAsync(string email, string role);
    Task<string> CreateLocalUserDisabledAsync(CreateUserRequest req);
    Task EnableUserAsync(string email);
    Task<string> SetTemporaryPasswordAsync(string email);
}

