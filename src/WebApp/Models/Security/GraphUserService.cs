using Microsoft.Graph;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Graph.Models;

namespace WebApp.Models.Security
{
    public sealed class GraphUserService : IGraphUserService
    {
        private readonly GraphServiceClient _graph;
        private readonly string _issuerDomain;
        private readonly string _extRoleName;

        public GraphUserService(GraphServiceClient graph, IConfiguration cfg)
        {
            _graph = graph;
            var ciam = cfg.GetSection("AzureAdCiam");
            _issuerDomain = ciam["IssuerDomain"]!;
            var extAppNoDashes = ciam["ExtensionsAppIdNoDashes"]!;
            _extRoleName = $"extension_{extAppNoDashes}_Role";
        }

        public async Task<CreateUserResult> CreateLocalUserAsync(InviteUserRequest req)
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
                    [_extRoleName] = EncodeRoles(req.Roles ?? Array.Empty<string>())
                }
            };

            var createdUser = await _graph.Users.PostAsync(user);
            return new CreateUserResult(createdUser.Id, tempPassword);
        }


        public async Task EnableUserAsync(string email)
        {
            var users = await _graph.Users.GetAsync(req =>
            {
                req.QueryParameters.Filter =
                    $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
                req.QueryParameters.Select = new[] { "id", "accountEnabled" };
            });

            var user = users?.Value?.FirstOrDefault() ?? throw new InvalidOperationException("User not found");

            // Enable the user in Azure AD
            await _graph.Users[user.Id].PatchAsync(new User { AccountEnabled = true });
        }
        private static string EncodeRoles(IEnumerable<string> roles)
        {
            return string.Join(";", roles
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim()));
        }

        public static string[] DecodeRoles(string? rolesRaw)
        {
            if (string.IsNullOrWhiteSpace(rolesRaw)) return Array.Empty<string>();
            return rolesRaw
                .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        public async Task<AdminUserDto?> GetUserByEmailAsync(string email)
        {
            var users = await _graph.Users.GetAsync(req =>
            {
                req.QueryParameters.Filter =
                    $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
                req.QueryParameters.Select = new[] { "id", "displayName", _extRoleName };
            });

            var user = users?.Value?.FirstOrDefault();
            if (user == null) return null;

            string? rolesRaw = null;
            if (user.AdditionalData != null &&
                user.AdditionalData.TryGetValue(_extRoleName, out var val) &&
                val is string s)
            {
                rolesRaw = s;
            }

            var roles = DecodeRoles(rolesRaw);

            return new AdminUserDto
            {
                Email = email,
                DisplayName = user.DisplayName,
                Roles = roles
            };
        }

        public async Task UpdateUserRolesAsync(string email, IEnumerable<string> roles)
        {
            var users = await _graph.Users.GetAsync(req =>
            {
                req.QueryParameters.Filter =
                    $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{_issuerDomain}')";
                req.QueryParameters.Select = new[] { "id" };
            });

            var user = users?.Value?.FirstOrDefault()
                       ?? throw new InvalidOperationException("User not found");

            var encoded = EncodeRoles(roles);

            var update = new User
            {
                AdditionalData = new Dictionary<string, object>
                {
                    [_extRoleName] = encoded
                }
            };

            await _graph.Users[user.Id].PatchAsync(update);
        }


    }


    public sealed record CreateUserResult(string Id, string TempPassword);
}
