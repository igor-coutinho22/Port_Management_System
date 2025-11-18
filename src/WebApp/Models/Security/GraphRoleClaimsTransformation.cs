using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;

namespace WebApp.Models.Security;

public sealed class GraphRoleClaimsTransformation : IClaimsTransformation
{
    private readonly GraphServiceClient _graph;
    private readonly string _issuerDomain;
    private readonly string _extRoleName;
    private readonly ILogger<GraphRoleClaimsTransformation> _logger;

    public GraphRoleClaimsTransformation(
        GraphServiceClient graph,
        string issuerDomain,
        string extensionsAppIdNoDashes,
        ILogger<GraphRoleClaimsTransformation> logger)
    {
        _graph = graph;
        _issuerDomain = issuerDomain;
        _extRoleName = $"extension_{extensionsAppIdNoDashes}_Role";
        _logger = logger;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        try
        {
            // If we already have a role, don't touch it
            if (principal.Claims.Any(c => c.Type == ClaimTypes.Role || c.Type == "roles"))
                return principal;

            var identity = (ClaimsIdentity)principal.Identity!;

            // 1) Try by objectId (oid) if present
            var oid = principal.FindFirst("oid")?.Value;
            if (!string.IsNullOrWhiteSpace(oid))
            {
                _logger.LogDebug("Role transform: trying by oid={Oid}", oid);

                var userById = await _graph.Users[oid].GetAsync(req =>
                {
                    req.QueryParameters.Select = new[] { "id", _extRoleName };
                });

                if (TryAddRoleFromUser(userById, identity))
                    return principal;
            }

            // 2) Try by email address if present
            var email = principal.FindFirst("emails")?.Value
                        ?? principal.FindFirst("email")?.Value;
            if (!string.IsNullOrWhiteSpace(email))
            {
                _logger.LogDebug("Role transform: trying by email={Email}", email);

                var usersByEmail = await _graph.Users.GetAsync(req =>
                {
                    req.QueryParameters.Filter =
                        $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
                    req.QueryParameters.Select = new[] { "id", _extRoleName };
                });

                var userByEmail = usersByEmail?.Value?.FirstOrDefault();
                if (TryAddRoleFromUser(userByEmail, identity))
                    return principal;
            }

            // 3) Fallback: use display name (name claim) – this we KNOW you have ("JoaoM")
            var displayName = principal.FindFirst("name")?.Value;
            if (!string.IsNullOrWhiteSpace(displayName))
            {
                _logger.LogDebug("Role transform: trying by displayName={DisplayName}", displayName);

                var usersByName = await _graph.Users.GetAsync(req =>
                {
                    req.QueryParameters.Filter = $"displayName eq '{displayName}'";
                    req.QueryParameters.Select = new[] { "id", _extRoleName, "displayName" };
                });

                var userByName = usersByName?.Value?.FirstOrDefault();
                if (TryAddRoleFromUser(userByName, identity))
                    return principal;
            }

            _logger.LogWarning("Role transform: no matching user / role found for principal with name={Name}",
                principal.FindFirst("name")?.Value);

            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Role transform failed.");
            return principal; // don't break auth on transform errors
        }
    }

    private bool TryAddRoleFromUser(Microsoft.Graph.Models.User? user, ClaimsIdentity identity)
    {
        if (user?.AdditionalData != null &&
            user.AdditionalData.TryGetValue(_extRoleName, out var val) &&
            val is string role &&
            !string.IsNullOrWhiteSpace(role))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
            identity.AddClaim(new Claim("roles", role));
            _logger.LogInformation("Role transform: added role '{Role}' for user {UserId}", role, user.Id);
            return true;
        }

        return false;
    }
}
