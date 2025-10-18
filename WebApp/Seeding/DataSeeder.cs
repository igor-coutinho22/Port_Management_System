// File: WebApp/Seeding/DataSeeder.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using WebApp.Models.Domain.Users;

namespace WebApp.Seeding
{
    public static class DataSeeder
    {
        /// <summary>
        /// Ensures roles exist and creates (or updates) an initial admin user.
        /// Call: await DataSeeder.SeedRolesAndAdminAsync(services, new[] { "Admin", "Manager", "Staff" });
        /// </summary>
        public static async Task SeedRolesAndAdminAsync(IServiceProvider services, string[] roles)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (roles == null) throw new ArgumentNullException(nameof(roles));

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");

            // Create roles if missing
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var rol = new IdentityRole(role);
                    var res = await roleManager.CreateAsync(rol);
                    if (!res.Succeeded)
                    {
                        logger.LogWarning("Failed to create role {Role}: {Errors}", role, string.Join(", ", res.Errors));
                    }
                }
            }

            // Create admin user (change these values for production!)
            var adminEmail = "admin@isep.ipp.pt";
            var adminUserName = adminEmail;
            var adminPassword = "***REMOVED***"; // use configuration / secrets in real apps

            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminUserName,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FullName = "Root Admin"
                };

                var createRes = await userManager.CreateAsync(admin, adminPassword);
                if (!createRes.Succeeded)
                {
                    logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", createRes.Errors));
                    return;
                }

                logger.LogInformation("Admin user created: {Email}", adminEmail);
            }
            else
            {
                logger.LogInformation("Admin user already exists: {Email}", adminEmail);
            }

            // Ensure user is in Admin role
            if (!await userManager.IsInRoleAsync(admin, "Admin"))
            {
                var addToRoleRes = await userManager.AddToRoleAsync(admin, "Admin");
                if (!addToRoleRes.Succeeded)
                {
                    logger.LogError("Failed to add admin to Admin role: {Errors}", string.Join(", ", addToRoleRes.Errors));
                }
                else
                {
                    logger.LogInformation("Admin user added to Admin role.");
                }
            }
        }
    }
}
