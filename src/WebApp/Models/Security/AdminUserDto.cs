public sealed class AdminUserDto
{
    public string Email { get; set; } = default!;
    public string? DisplayName { get; set; }
    public string[] Roles { get; set; } = Array.Empty<string>();
}
