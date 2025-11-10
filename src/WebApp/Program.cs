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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WebApp.Models.Domain.Scheduling.Interfaces;

Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");

var builder = WebApplication.CreateBuilder(args);

// ---------- Database ----------
builder.Services.AddDbContext<PortManagementContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure())
);

// ---------- Identity with Roles ----------
// NOTE: Keep Identity for internal role management and user records.
// Do NOT use cookie-based login for the SPA; SPA will use JWT bearer from External ID.
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

// (Optional, for MVC/Razor areas you may still have; SPA won’t use this)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});

// ---------- CORS (ADD) ----------
builder.Services.AddCors(opt =>
{
    var origins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
    opt.AddDefaultPolicy(p => p
        .WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ---------- Authentication: JWT Bearer (External ID/B2C) (ADD) ----------
var host = "https://sinesport.ciamlogin.com";
var tenantId = "a8192c11-2c11-4411-a807-8b0659f4c9a9"; // GUID
var appIdUri = "api://port-management";                // from Expose an API

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Standard CIAM discovery (no policy)
        options.Authority = $"{host}/{tenantId}/v2.0";
        options.MetadataAddress = $"{host}/{tenantId}/v2.0/.well-known/openid-configuration";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = appIdUri,   // MUST equal Application ID URI (not the scope)
            ValidateLifetime = true
        };
    });

// ---------- Authorization ----------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireManagerRole", policy =>
        policy.RequireRole("Manager", "Admin"));
});

builder.Services.AddControllersWithViews().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter(
            System.Text.Json.JsonNamingPolicy.CamelCase
        ));
});
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------- DI registrations (yours) ----------
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

// ADD: CORS before auth
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages();

// --- ADD: /api/me for SPA to load internal role after IAM login ---
// This assumes you want to keep Identity roles as your "internal role" store.
// We do NOT create passwords here. We bind an ApplicationUser to the external subject/email.
app.MapGet("/api/me", async (HttpContext http,
                            UserManager<ApplicationUser> userManager,
                            RoleManager<IdentityRole> roleManager) =>
{
    // Validate bearer auth
    if (!http.User.Identity?.IsAuthenticated ?? true)
        return Results.Unauthorized();

    // External token claims (B2C typically provides "sub" and "emails" or "email")
    var sub = http.User.FindFirst("sub")?.Value;
    var email = http.User.FindFirst("emails")?.Value ?? http.User.FindFirst("email")?.Value;

    if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
        return Results.BadRequest(new { error = "Required claims missing (sub/email)." });

    // Find existing user by email; if not present, create WITHOUT password.
    var user = await userManager.FindByEmailAsync(email);
    if (user == null)
    {
        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            // If your ApplicationUser has an ExternalSubjectId property, set it here:
            // ExternalSubjectId = sub
        };
        // Create user record without password; no local sign-in.
        var createResult = await userManager.CreateAsync(user);
        if (!createResult.Succeeded)
            return Results.StatusCode(500);
        // Optionally: assign default role (e.g., "Staff") here if that’s your policy.
        if (await roleManager.RoleExistsAsync("Staff"))
            await userManager.AddToRoleAsync(user, "Staff");
    }

    var roles = await userManager.GetRolesAsync(user);
    var role = roles.FirstOrDefault();

    // If no role or role is inactive according to your policy, deny:
    if (string.IsNullOrWhiteSpace(role))
        return Results.StatusCode(StatusCodes.Status403Forbidden);

    // Build response for SPA
    return Results.Ok(new
    {
        id = user.Id,
        email = user.Email,
        firstName = http.User.FindFirst("given_name")?.Value ?? "",
        lastName = http.User.FindFirst("family_name")?.Value ?? "",
        role
        // You can also include allowed features here, based on role
    });
}).RequireAuthorization();

// SPA Configuration - serve index.html for root and SPA routes
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

// Fallback to index.html for SPA routing (for routes like /home, /vessels, etc.)
app.MapFallback(async context =>
{
    // Only apply SPA fallback for non-API routes
    if (!context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
    }
});

app.Run();

public partial class Program { }
