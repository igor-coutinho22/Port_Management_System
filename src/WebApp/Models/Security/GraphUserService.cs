using Microsoft.Graph;
using Microsoft.Graph.Models;
using WebApp.Models.Security;

public sealed class GraphUserService : IGraphUserService
{
    private readonly GraphServiceClient _graph;
    private readonly string _issuerDomain;
    private readonly string _extRoleName;
    private readonly IEmailSender _emailSender;

    public GraphUserService(GraphServiceClient graph, IConfiguration cfg, IEmailSender emailSender)
    {
        _graph = graph;
        var ciam = cfg.GetSection("AzureAdCiam");
        _issuerDomain = ciam["IssuerDomain"]!;
        var extAppNoDashes = ciam["ExtensionsAppIdNoDashes"]!;
        _extRoleName = $"extension_{extAppNoDashes}_Role";
        _emailSender = emailSender;
    }

    public async Task<string> SetTemporaryPasswordAsync(string email)
    {
        var tempPassword = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "aA1!";  // Secure random password

        // Get user by email
        var users = await _graph.Users.GetAsync(req =>
        {
            req.QueryParameters.Filter = $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
            req.QueryParameters.Select = new[] { "id" };
        });

        var u = users?.Value?.FirstOrDefault() ?? throw new InvalidOperationException("User not found");

        // Set temporary password
        await _graph.Users[u.Id].PatchAsync(new User
        {
            PasswordProfile = new PasswordProfile
            {
                Password = tempPassword,
                ForceChangePasswordNextSignIn = true  // Forces the user to change their password at next sign-in
            }
        });

        // Send email with password
        await _emailSender.SendEmailAsync(email, "Temporary Password", $"Your temporary password is {tempPassword}. Please log in and change your password.");

        return tempPassword;
    }

    
    public async Task<string> CreateLocalUserAsync(CreateUserRequest req)
    {
        var user = new User
        {
            DisplayName = req.DisplayName,
            Identities = new List<ObjectIdentity> {
                new() {
                    SignInType = "emailAddress",
                    Issuer = _issuerDomain,
                    IssuerAssignedId = req.Email
                }
            },
            PasswordProfile = new PasswordProfile { Password = req.Password, ForceChangePasswordNextSignIn = false },
            PasswordPolicies = "DisablePasswordExpiration",
            AccountEnabled = true,
            AdditionalData = new Dictionary<string, object>
            {
                [_extRoleName] = req.Role
            }
        };

        var created = await _graph.Users.PostAsync(user);
        return created!.Id!;
    }

    public async Task SetUserRoleAsync(string email, string role)
    {
        var users = await _graph.Users.GetAsync(req =>
        {
            req.QueryParameters.Filter =
                $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
            req.QueryParameters.Select = new[] { "id" };
        });

        var u = users?.Value?.FirstOrDefault() ?? throw new InvalidOperationException("User not found");

        await _graph.Users[u.Id].PatchAsync(new User
        {
            AdditionalData = new Dictionary<string, object> { [_extRoleName] = role }
        });
    }

    public async Task<string> CreateLocalUserDisabledAsync(CreateUserRequest req)
    {
        var tempPassword = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "aA1!";

        var user = new User
        {
            DisplayName = req.DisplayName,
            Identities = new List<ObjectIdentity> {
            new() {
                SignInType = "emailAddress",
                Issuer = _issuerDomain,             
                IssuerAssignedId = req.Email
            }
        },
            PasswordProfile = new PasswordProfile
            {
                Password = tempPassword,
                ForceChangePasswordNextSignIn = true
            },
            PasswordPolicies = "DisablePasswordExpiration",
            AccountEnabled = false,                   
            AdditionalData = new Dictionary<string, object>
            {
                [_extRoleName] = req.Role             
            }
        };

        var created = await _graph.Users.PostAsync(user);
        return created!.Id!;
    }

    public async Task EnableUserAsync(string email)
    {
        var users = await _graph.Users.GetAsync(req =>
        {
            req.QueryParameters.Filter =
                $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
            req.QueryParameters.Select = new[] { "id", "accountEnabled" };
        });

        var u = users?.Value?.FirstOrDefault() ?? throw new InvalidOperationException("User not found");

        await _graph.Users[u.Id].PatchAsync(new User { AccountEnabled = true });
    }

}