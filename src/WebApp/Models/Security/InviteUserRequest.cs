namespace WebApp.Models.Security
{
    public sealed class InviteUserRequest
    {
        public string Email { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string[] Roles { get; set; } = Array.Empty<string>();
    }
}
