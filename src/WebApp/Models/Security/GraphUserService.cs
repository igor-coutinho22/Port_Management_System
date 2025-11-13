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
                PasswordProfile = new PasswordProfile { Password = tempPassword, ForceChangePasswordNextSignIn = true },
                PasswordPolicies = "DisablePasswordExpiration",
                AccountEnabled = false,
                AdditionalData = new Dictionary<string, object>
                {
                    [_extRoleName] = req.Role
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

    }



    public sealed record CreateUserResult(string Id, string TempPassword);
}
