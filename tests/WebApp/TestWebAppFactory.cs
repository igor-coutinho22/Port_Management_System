using System.Linq;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Models.Context;
using WebApp.Tests.Auth;

public class TestWebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((context, config) =>
        {
            // Load appsettings + appsettings.Testing.json + env vars (optional file)
            config.AddJsonFile("appsettings.json", optional: false)
                  .AddJsonFile("appsettings.Testing.json", optional: true)
                  .AddEnvironmentVariables();
        });

        builder.ConfigureServices((context, services) =>
        {
            // If the app already registered PortManagementContext, remove it
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<PortManagementContext>));
            if (descriptor != null) services.Remove(descriptor);

            // Use the connection string from config
            var cs = context.Configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<PortManagementContext>(options =>
                options.UseSqlServer(cs, sql => sql.EnableRetryOnFailure()));

            services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, FakeAuthHandler>("Test", _ => { });
        });
    }
}
