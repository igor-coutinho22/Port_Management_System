using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Services.VesselService;
using WebApp.Models.Context;
using WebApp.Models.Domain.Users;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Infrastructure.Repositories.VesselRepository;
using WebApp.Seeding; 

var builder = WebApplication.CreateBuilder(args);

// ---------- Database ----------
builder.Services.AddDbContext<PortManagementContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure())
);

// ---------- Identity with Roles (use ApplicationUser) ----------
builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddRoles<IdentityRole>() // enable role management
.AddEntityFrameworkStores<PortManagementContext>()
.AddDefaultTokenProviders();

builder.Logging.AddConsole();

// Configure Identity cookie paths
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});

// ---------- Authentication (optional additional schemes) ----------
builder.Services.AddAuthentication(); // keep defaults (cookie)

// ---------- Authorization policies ----------
builder.Services.AddAuthorization(options =>
{
    // role-based policy example
    options.AddPolicy("RequireManagerRole", policy =>
        policy.RequireRole("Manager", "Admin"));

    // policy requiring a specific claim (example)
    // options.AddPolicy("RequireDepartmentX", p => p.RequireClaim("Department", "X"));
});

// ---------- MVC / Razor / Swagger ----------
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages(); // required for Identity UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------- Application DI (example services) ----------
builder.Services.AddScoped<IQualificationRepository, QualificationRepository>();
builder.Services.AddScoped<IQualificationService, QualificationService>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IVesselRepository, VesselRepository>();
builder.Services.AddScoped<IVesselService, VesselService>();

// Vessel type services & repository (required by VesselService)
builder.Services.AddScoped<WebApp.Models.Infrastructure.Repositories.IVesselTypeRepository, WebApp.Models.Infrastructure.Repositories.VesselTypeRepository.VesselTypeRepository>();
builder.Services.AddScoped<WebApp.Models.Application.Services.IVesselTypeService, WebApp.Models.Application.Services.VesselTypeService.VesselTypeService>();

var app = builder.Build();

// ---------- Ensure DB + seed roles/admin ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<PortManagementContext>();
        db.Database.Migrate();

        // Seed roles and a root admin user (implement below)
        await WebApp.Seeding.DataSeeder.SeedRolesAndAdminAsync(services, new[] { "Admin", "Manager", "Staff" });
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        throw;
    }
}

// ---------- Middleware ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages(); // Identity UI
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

app.Run();
