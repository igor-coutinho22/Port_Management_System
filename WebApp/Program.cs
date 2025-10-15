using Microsoft.EntityFrameworkCore;
using WebApp.Models;
using WebApp.Models.Context;
using WebApp.Models.Application.Services;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Infrastructure.Repositories.VesselRepository;
using WebApp.Models.Application.Services.VesselService;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"))
        .EnableTokenAcquisitionToCallDownstreamApi()
            .AddMicrosoftGraph(builder.Configuration.GetSection("MicrosoftGraph"))
            .AddInMemoryTokenCaches();

builder.Services.AddControllers();
builder.Services.AddDbContext<PortManagementContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("PortDb")));

builder.Services.AddScoped<IQualificationRepository, QualificationRepository>();
builder.Services.AddScoped<IQualificationService, QualificationService>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IVesselRepository, VesselRepository>();
builder.Services.AddScoped<IVesselService, VesselService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
