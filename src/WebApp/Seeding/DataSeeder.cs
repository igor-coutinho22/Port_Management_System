// File: WebApp/Seeding/DataSeeder.cs 
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Users;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.VesselVisits;

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

        public static async Task SeedDomainDataAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PortManagementContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");

            if (context.Database.IsRelational())
                await context.Database.MigrateAsync();

            // === QUALIFICATIONS ===
            if (!await context.Set<Qualification>().AnyAsync())
            {
                var qualifications = new List<Qualification>
                {
                    new("Q1", "Crane Operator License"),
                    new("Q2", "Heavy Vehicle Driver's License"),
                    new("Q3", "Hazardous Cargo Handling"),
                    new("Q4","Driver's License")
                };

                await context.AddRangeAsync(qualifications);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Qualifications.", qualifications.Count);
            }

            // === RESOURCES ===
            if (!await context.Set<Resource>().AnyAsync())
            {
                var allQualifications = await context.Set<Qualification>().ToListAsync();

                var resources = new List<Resource>
                {
                    new("R001", "STS Crane #1",
                        ResourceType.STSCrane,
                        operationalCapacity: 60,
                        status: ResourceAvailabilityStatus.Active,
                        setupTime: 120,
                        qualifications: new HashSet<Qualification> { allQualifications[0], allQualifications[2] }),

                    new("R002", "Yard Crane #1",
                        ResourceType.YardCrane,
                        operationalCapacity: 40,
                        status: ResourceAvailabilityStatus.Active,
                        setupTime: 40,
                        qualifications: new HashSet<Qualification> { allQualifications[0] }),

                    new("R003", "Truck #1",
                        ResourceType.Truck,
                        operationalCapacity: 20,
                        status: ResourceAvailabilityStatus.UnderMaintenance,
                        setupTime: 5,
                        qualifications: new HashSet<Qualification> { allQualifications[3] })
                };

                await context.AddRangeAsync(resources);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Resources.", resources.Count);
            }

            // === STAFF ===
            if (!await context.Set<Staff>().AnyAsync())
            {
                var qualifications = await context.Set<Qualification>().ToListAsync();

                var staffMembers = new List<Staff>
                {
                    new("S001", "Alice", "alice@port.pt", "911111111",
                        StaffStatus.Available, "06:00-14:00"),

                    new("S002", "Bruno", "bruno@port.pt", "922222222",
                        StaffStatus.Unavailable, "14:00-22:00"),

                    new("S003", "Carla", "carla@port.pt", "933333333",
                        StaffStatus.Available, "06:00-14:00")
                };

                await context.AddRangeAsync(staffMembers);
                await context.SaveChangesAsync();

                // Assign qualifications via QualificationLink
                var qualificationLinks = new List<QualificationLink>
                {
                    new QualificationLink("S001", "Q1", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-2))),
                    new QualificationLink("S002", "Q2", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1))),
                    new QualificationLink("S003", "Q3", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-3))),
                    new QualificationLink("S003", "Q1", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-2)))
                };

                await context.AddRangeAsync(qualificationLinks);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeded {Count} Staff Members and {Count2} Qualification Links.",
                    staffMembers.Count, qualificationLinks.Count);
            }




            // === VESSEL VISIT NOTIFICATIONS ===
            if (!await context.Set<VesselVisitNotification>().AnyAsync())
            {
                // Use realistic IMO numbers (7 digits)
                var vesselIMO1 = "1234567";
                var vesselIMO2 = "2345678";
                var vesselIMO3 = "3456789";
                var vesselIMO4 = "4567890";
                
                var dock1 = Guid.NewGuid();
                var dock2 = Guid.NewGuid();

                var visit1 = new VesselVisitNotification(vesselIMO1, dock1, DateTime.UtcNow.AddDays(-1), VisitPurpose.Maintenance);
                visit1.AddCrewMember("John Doe", "C123", "PT");

                var visit2 = new VesselVisitNotification(vesselIMO2, dock1, DateTime.UtcNow.AddDays(1), VisitPurpose.Commercial);
                visit2.AddCrewMember("Maria Silva", "C456", "ES");
                visit2.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));

                var visit3 = new VesselVisitNotification(vesselIMO3, dock2, DateTime.UtcNow.AddDays(2), VisitPurpose.Commercial);
                visit3.AddCrewMember("Carlos Mendes", "C789", "BR");
                visit3.AddUnloadingManifest(new CargoManifest(CargoManifestType.Unloading));

                var visit4 = new VesselVisitNotification(vesselIMO4, dock2, DateTime.UtcNow.AddDays(3), VisitPurpose.Commercial);
                visit4.AddCrewMember("Eva Liu", "C999", "CN");
                visit4.AddLoadingManifest(new CargoManifest(CargoManifestType.Loading));
                visit4.AddUnloadingManifest(new CargoManifest(CargoManifestType.Unloading));

                await context.AddRangeAsync(visit1, visit2, visit3, visit4);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Vessel Visit Notifications.", 4);
            }
        }
    }
}
