using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Graph;

namespace WebApp.Models.Security;
public sealed class GraphRoleClaimsTransformation : IClaimsTransformation
{
    private readonly GraphServiceClient _graph;
    private readonly string _issuerDomain;   
    private readonly string _extRoleName;   

    public GraphRoleClaimsTransformation(GraphServiceClient graph, string issuerDomain, string extensionsAppIdNoDashes)
    {
        _graph = graph;
        _issuerDomain = issuerDomain;
        _extRoleName = $"extension_{extensionsAppIdNoDashes}_Role";
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Skip if any role already present
        if (principal.Claims.Any(c => c.Type == ClaimTypes.Role || c.Type == "roles"))
            return principal;

        var email = principal.FindFirst("emails")?.Value ?? principal.FindFirst("email")?.Value;
        if (string.IsNullOrWhiteSpace(email))
            return principal;

        var users = await _graph.Users.GetAsync(req =>
        {
            req.QueryParameters.Filter =
                $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
            req.QueryParameters.Select = new[] { "id", _extRoleName };
        });

        var u = users?.Value?.FirstOrDefault();
        if (u?.AdditionalData != null &&
            u.AdditionalData.TryGetValue(_extRoleName, out var val) &&
            val is string role && !string.IsNullOrWhiteSpace(role))
        {
            var id = (ClaimsIdentity)principal.Identity!;
            id.AddClaim(new Claim(ClaimTypes.Role, role));
            id.AddClaim(new Claim("roles", role));
        }

        return principal;
    }
}