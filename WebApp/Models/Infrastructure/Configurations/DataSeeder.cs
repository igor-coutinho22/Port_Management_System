using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using WebApp.Models.Domain.Users;

public static class DataSeeder
{
    public static async Task SeedRootUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Ensure Admin role exists
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole("Admin"));

        // Create root user if missing
        string rootEmail = "admin@isep.ipp.pt";
        string rootPassword = "***REMOVED***";

        var rootUser = await userManager.FindByEmailAsync(rootEmail);
        if (rootUser == null)
        {
            rootUser = new ApplicationUser
            {
                UserName = rootEmail,
                Email = rootEmail,
                EmailConfirmed = true,
                FullName = "Root Administrator"
            };

            var result = await userManager.CreateAsync(rootUser, rootPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(rootUser, "Admin");
            }
        }
    }
}
