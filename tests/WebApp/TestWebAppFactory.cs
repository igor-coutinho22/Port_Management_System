using System;
using System.Linq;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Models.Context;
using WebApp.Seeding;
using WebApp.Tests.Auth;

public class TestWebAppFactory : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddJsonFile("appsettings.json", optional: false)
                  .AddJsonFile("appsettings.Testing.json", optional: true)
                  .AddEnvironmentVariables();
        });

        builder.ConfigureServices(services =>
        {
            // Remove the real DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<PortManagementContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            // Single in-memory SQLite connection for the whole factory
            _connection ??= new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<PortManagementContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            // Build provider and seed DB
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;

            var context = scopedServices.GetRequiredService<PortManagementContext>();

            // Create schema
            context.Database.EnsureCreated();

            // Seed domain data (this will now NOT call Migrate on SQLite)
            DataSeeder.SeedDomainDataAsync(scopedServices).GetAwaiter().GetResult();

            // Fake authentication
            services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, FakeAuthHandler>("Test", _ => { });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && _connection is not null)
        {
            _connection.Close();
            _connection.Dispose();
            _connection = null;
        }
    }
}
