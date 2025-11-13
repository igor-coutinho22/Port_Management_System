namespace WebApp.Models.Security
{
    public sealed class InviteUserRequest
    {
        public string Email { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
