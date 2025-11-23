using Azure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebApp.Models.Application.Services;
using WebApp.Models.Application.Services.Qualifications;
using WebApp.Models.Application.Services.Resources;
using WebApp.Models.Application.Services.StaffService;
using WebApp.Models.Application.Services.VesselService;
using WebApp.Models.Application.Services.VesselTypeService;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications.Interfaces;
using WebApp.Models.Domain.Resources.Interfaces;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Infrastructure.Repositories.Qualifications;
using WebApp.Models.Infrastructure.Repositories.Resources;
using WebApp.Models.Infrastructure.Repositories.StaffRepository;
using WebApp.Models.Infrastructure.Repositories.VesselRepository;
using WebApp.Models.Infrastructure.Repositories.VesselTypeRepository;
using WebApp.Models.Application.Services.Scheduling;
using WebApp.Seeding;
using WebApp.Models.Domain.Staff.Interfaces;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.VesselVisits.Services;
using WebApp.Models.Security;
using WebApp.Security;
using Microsoft.AspNetCore.Mvc;
using WebApp.Models.Domain.Scheduling.Services;

Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");

var builder = WebApplication.CreateBuilder(args);

Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

builder.Logging.AddConsole();

// ---------- Database ----------
builder.Services.AddDbContext<PortManagementContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure())
);

// ---------- CORS ----------
builder.Services.AddCors(opt =>
{
    var origins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>()
                  ?? new[] { "https://localhost:5179" };
    opt.AddDefaultPolicy(p => p
        .WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ---------- Authentication (CIAM) ----------
var ciam = builder.Configuration.GetSection("AzureAdCiam");
var issuerDomain = ciam["IssuerDomain"];

var host = ciam["AuthorityHost"];      // https://sinesport.ciamlogin.com
var tenantId = ciam["TenantId"];       // a8192c11-...
var authority = $"{host!.TrimEnd('/')}/{tenantId}/v2.0";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.Authority = authority;
    options.MetadataAddress = $"{authority}/.well-known/openid-configuration";

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = $"{host!.TrimEnd('/')}/{tenantId}/v2.0/",
        ValidateAudience = true,
        ValidAudiences = new[]
        {
            "api://port-management",
            "6bff1175-b880-4a1d-b320-ff8fcbbd1b99" // API app's clientId
        },
        ValidateLifetime = true,
        RoleClaimType = "roles",
        NameClaimType = "name"
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx =>
        {
            var log = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            log.LogError(ctx.Exception, "JWT authentication failed.");
            return Task.CompletedTask;
        },
        OnTokenValidated = ctx =>
        {
            var log = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var iss = ctx.Principal!.FindFirst("iss")?.Value;
            var auds = string.Join(",", ctx.Principal!.FindAll("aud").Select(c => c.Value));
            log.LogInformation("JWT validated iss={Iss} aud={Aud}", iss, auds);
            return Task.CompletedTask;
        },
        OnChallenge = ctx =>
        {
            var log = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            log.LogWarning("JWT challenge: {Error} {Description}", ctx.Error, ctx.ErrorDescription);
            return Task.CompletedTask;
        },
        OnForbidden = ctx =>
        {
            var log = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            log.LogWarning("Forbidden: user {User} tried to access {Path}",
                ctx.Principal?.Identity?.Name,
                ctx.HttpContext.Request.Path);
            return Task.CompletedTask;
        }
    };
});


// ---------- Authorization ----------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireOpsRole", policy =>
        policy.RequireRole(Roles.Ops));

    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole(Roles.Admin));

    options.AddPolicy("RequireOperator", policy =>
        policy.RequireRole(Roles.Operator, Roles.Admin));

    options.AddPolicy("RequireOfficer", policy =>
    policy.RequireRole(Roles.Officer, Roles.Admin));

    options.AddPolicy("RequireRepresentative", policy =>
        policy.RequireRole(Roles.Representative, Roles.Admin));

    options.AddPolicy("RequireRole", policy =>
    policy.RequireRole(Roles.All));
});

// HTTP client for prolog service
builder.Services.AddHttpClient("DomainBackend", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["DomainBackend:BaseUrl"]!);
    client.DefaultRequestHeaders.Accept.Add(
        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
});


// ---------- MVC / JSON ----------
builder.Services.AddControllersWithViews().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});
builder.Services.AddRazorPages();

// ---------- Swagger (with JWT) ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Port API", Version = "v1" });

    var host = builder.Configuration["AzureAdCiam:AuthorityHost"]; // https://sinesport.ciamlogin.com
    var tenantId = builder.Configuration["AzureAdCiam:TenantId"];  // a8192c11-...

    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri($"{host}/{tenantId}/oauth2/v2.0/authorize", UriKind.Absolute),
                TokenUrl = new Uri($"{host}/{tenantId}/oauth2/v2.0/token", UriKind.Absolute),
                Scopes = new Dictionary<string, string>
            {
                // your API scope
                { "api://port-management/api.read", "Access Port Management API" }
            }
            }
        }
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
            },
            new[] { "api://port-management/api.read" }
        }
    });
});

// ---------- DI: repositories/services ----------
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
builder.Services.AddScoped<IGraphUserService, GraphUserService>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IHeuristicScheduleService, HeuristicScheduleService>();


var backendClientId = ciam["BackendApp:ClientId"];
var backendClientSecret = ciam["BackendApp:ClientSecret"];
var extAppNoDashes = ciam["ExtensionsAppIdNoDashes"];

builder.Services.AddSingleton(sp =>
{
    var credential = new ClientSecretCredential(
        tenantId!, backendClientId!, backendClientSecret!,
        new TokenCredentialOptions { AuthorityHost = new Uri(host!) });

    return new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });
});

// claims transform to read Role attribute from Graph and inject role claims
builder.Services.AddSingleton<IClaimsTransformation>(sp =>
    new GraphRoleClaimsTransformation(
        sp.GetRequiredService<GraphServiceClient>(),
        issuerDomain!,
        extAppNoDashes!,
        sp.GetRequiredService<ILogger<GraphRoleClaimsTransformation>>()
    )
);


// user admin service
builder.Services.AddScoped<IGraphUserService, GraphUserService>();

var app = builder.Build();

// ---------- DB migrate + seed ONLY domain data ----------
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
    app.UseSwaggerUI(ui =>
    {
        ui.SwaggerEndpoint("/swagger/v1/swagger.json", "Port API v1");

        ui.OAuthClientId("453a7c55-4b93-4b26-8280-4d87954bdf19");

        ui.OAuthUsePkce();

        ui.OAuthScopes("api://port-management/api.read");
        ui.OAuthAppName("Swagger - Port Management");
    });
}

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();


app.MapGet("/api/admin/debug-user", async (
    [FromQuery] string email,
    GraphServiceClient graph,
    IConfiguration cfg) =>
{
    var ciam = cfg.GetSection("AzureAdCiam");
    var issuerDomain = ciam["IssuerDomain"];
    var extAppNoDashes = ciam["ExtensionsAppIdNoDashes"];
    var extRoleName = $"extension_{extAppNoDashes}_Role";

    var users = await graph.Users.GetAsync(req =>
    {
        req.QueryParameters.Filter =
            $"identities/any(c:c/issuerAssignedId eq '{email}' and c/issuer eq '{issuerDomain}')";
        req.QueryParameters.Select = new[] { "id", "displayName", extRoleName };
    });

    var user = users?.Value?.FirstOrDefault();
    if (user == null)
        return Results.NotFound("User not found");

    return Results.Ok(new
    {
        user.Id,
        user.DisplayName,
        Extensions = user.AdditionalData    // should now contain the Role
    });
});


// ---- Helper endpoint: who am I (from token/claims) ----
app.MapGet("/api/me", (HttpContext http) =>
{
    if (!http.User.Identity?.IsAuthenticated ?? true)
        return Results.Unauthorized();

    var email = http.User.FindFirst("emails")?.Value
                ?? http.User.FindFirst("email")?.Value;

    var first = http.User.FindFirst("given_name")?.Value ?? "";
    var last = http.User.FindFirst("family_name")?.Value ?? "";
    var rawName = http.User.FindFirst("name")?.Value ?? http.User.Identity?.Name;
    var name = !string.IsNullOrWhiteSpace(rawName)
        ? rawName
        : $"{first} {last}".Trim();

    var roles = http.User.Claims
        .Where(c => c.Type == ClaimTypes.Role || c.Type == "roles")
        .Select(c => c.Value)
        .Distinct()
        .ToArray();

    if (roles.Length == 0)
        return Results.StatusCode(StatusCodes.Status403Forbidden);

    return Results.Ok(new { email, firstName = first, lastName = last, name, roles });
}).RequireAuthorization();



app.MapControllers();
app.MapRazorPages();

// SPA root
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

// SPA fallback for non-API routes
app.MapFallback(async context =>
{
    if (!context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
    }
});

app.Run();

public partial class Program { }
