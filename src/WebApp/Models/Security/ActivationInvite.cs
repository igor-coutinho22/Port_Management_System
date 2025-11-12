namespace WebApp.Models.Security;

public class ActivationInvite
{
    public Guid Id { get; set; } = Guid.NewGuid();   // token
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!;
    public DateTime ExpiresUtc { get; set; } = DateTime.UtcNow.AddDays(2);
    public bool Used { get; set; } = false;
}
