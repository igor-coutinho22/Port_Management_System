using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Services.Resources;
using WebApp.Models.Application.Services.VesselService;
using WebApp.Models.Application.Services.VesselTypeService;
using WebApp.Models.Context;
using WebApp.Models.Domain.Resources.Interfaces;
using WebApp.Models.Domain.Users;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Infrastructure.Repositories.Resources;
using WebApp.Models.Infrastructure.Repositories.VesselRepository;
using WebApp.Seeding;
using WebApp.Models.Infrastructure.Repositories.VesselTypeRepository;
using WebApp.Models.Domain.Qualifications.Interfaces;
using WebApp.Models.Application.Services.Qualifications;
using WebApp.Models.Infrastructure.Repositories.Qualifications;
using WebApp.Models.Domain.Staff.Interfaces;
using WebApp.Models.Infrastructure.Repositories.StaffRepository;
using WebApp.Models.Application.Services.StaffService;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;

Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");

var builder = WebApplication.CreateBuilder(args);

// ---------- Database ----------
builder.Services.AddDbContext<PortManagementContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure())
);

// ---------- Identity with Roles ----------
builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<PortManagementContext>()
.AddDefaultTokenProviders();

builder.Logging.AddConsole();


builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});

builder.Services.AddAuthentication();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireManagerRole", policy =>
        policy.RequireRole("Manager", "Admin"));
});


builder.Services.AddControllersWithViews().AddJsonOptions(options =>
{
    // Use enum names instead of numbers
    // Aldo accepts lower case
    options.JsonSerializerOptions.Converters.Add(
    new System.Text.Json.Serialization.JsonStringEnumConverter(
        System.Text.Json.JsonNamingPolicy.CamelCase
    ));

});;
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IQualificationRepository, QualificationRepository>();
builder.Services.AddScoped<IQualificationService, QualificationService>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IVesselRepository, VesselRepository>();
builder.Services.AddScoped<IVesselService, VesselService>();
builder.Services.AddScoped<IVesselTypeRepository, VesselTypeRepository>();
builder.Services.AddScoped<IVesselTypeService, VesselTypeService>();
builder.Services.AddScoped<IStorageAreaRepository, StorageAreaRepository>();
builder.Services.AddScoped<IStorageAreaService, StorageAreaService>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();
builder.Services.AddScoped<IResourceService, ResourceService>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IRepresentativeRepository, RepresentativeRepository>();
builder.Services.AddScoped<IRepresentativeService, RepresentativeService>();
builder.Services.AddScoped<IDockRepository, DockRepository>();
builder.Services.AddScoped<IDockService, DockService>();
builder.Services.AddScoped<IVesselVisitNotificationRepository, VesselVisitNotificationRepository>();
builder.Services.AddScoped<IVesselVisitNotificationService, VesselVisitNotificationService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<PortManagementContext>();
        if (db.Database.IsRelational())
            db.Database.Migrate();
        await DataSeeder.SeedRolesAndAdminAsync(services, new[] { "Admin", "Manager", "Staff" });
        await DataSeeder.SeedDomainDataAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages();
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

app.Run();


public partial class Program { }