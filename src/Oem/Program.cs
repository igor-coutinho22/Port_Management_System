using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using System.Text.Json.Serialization;
using Oem.Models.Context;
using Microsoft.OpenApi.Models;
using Oem.Security;
using Oem.Integration;
using Oem.Models.Domain.Scheduling.Services;
using Oem.Models.Application.Services.Scheduling;
using Azure.Identity;
using Microsoft.Graph;
using Microsoft.AspNetCore.Authentication;
using Oem.Models.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

// ---------- 1. Database (CHANGED: Use OemContext) ----------
builder.Services.AddDbContext<OemContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
    npgsqlOptions =>
        {
            npgsqlOptions.UseAdminDatabase("efadmin");
        })
);

// ---------- 2. CORS (COPIED: Must match Frontend) ----------
builder.Services.AddCors(opt =>
{
    // 1. Try to read from appsettings.json
    var origins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() 
                  ?? new[] { "https://localhost:5179" }; // 2. Fallback if missing

    opt.AddDefaultPolicy(p => p
        .WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ---------- 3. Authentication (COPIED: Same Azure Config) ----------
var ciam = builder.Configuration.GetSection("AzureAdCiam");
var issuerDomain = ciam["IssuerDomain"];

var host = ciam["AuthorityHost"];
var tenantId = ciam["TenantId"];
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
            "api://port-management", // Keep this if both APIs share the same App Reg
            "6bff1175-b880-4a1d-b320-ff8fcbbd1b99" 
        },
        ValidateLifetime = true,
        // RoleClaimType = "roles",
        NameClaimType = "name"
    };
});

// ---------- 4. Authorization (COPIED) ----------
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

// 1. Register the HTTP Client to talk to WebApp
builder.Services.AddHttpClient("DomainBackend", client =>
{
    // Read from appsettings.json instead of hardcoding
    var baseUrl = builder.Configuration["DomainBackend:BaseUrl"]; 
    client.BaseAddress = new Uri(baseUrl ?? "https://localhost:5001"); 
    
    client.DefaultRequestHeaders.Accept.Add(
        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
})
// 2. APPLY THE SSL FIX HERE (Crucial for Dev environment)
.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
});

// 3. Keep this (Required for getting the current User's token)
builder.Services.AddHttpContextAccessor();

// ---------- 5. JSON Options (COPIED: Formatting) ----------
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();

// ---------- 6. Swagger (COPIED: Docs) ----------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "OEM API", Version = "v1" }); // Changed Title

    // Reusing the same OAuth flow is fine for this project scope
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

// ---------- 7. Dependency Injection (NEW) ----------

// Register the Integration Service
builder.Services.AddScoped<IWebAppService, WebAppService>();
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

// DO NOT copy VesselRepository/StaffService here.
// Register your NEW Sprint C services here later:
// builder.Services.AddScoped<IOperationPlanRepository, OperationPlanRepository>();
// builder.Services.AddScoped<IIncidentService, IncidentService>();

var app = builder.Build();

// ---------- 8. Pipeline (COPIED) ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(ui =>
    {
        ui.SwaggerEndpoint("/swagger/v1/swagger.json", "OEM API v1");
        ui.OAuthClientId("453a7c55-4b93-4b26-8280-4d87954bdf19"); // Same Client ID
        ui.OAuthUsePkce();
        ui.OAuthScopes("api://port-management/api.read");
    });
}

app.UseHttpsRedirection();
app.UseCors(); // Very important
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();