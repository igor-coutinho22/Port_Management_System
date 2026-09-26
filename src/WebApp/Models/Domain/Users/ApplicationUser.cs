using Microsoft.AspNetCore.Identity;

namespace WebApp.Models.Domain.Users
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
    }
}
