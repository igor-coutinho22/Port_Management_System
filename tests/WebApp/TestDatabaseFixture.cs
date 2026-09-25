using System;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using WebApp.Models.Context;
using WebApp.Seeding;

public class TestDatabaseFixture : IDisposable
{
    public DbContextOptions<PortManagementContext> Options { get; }
    private readonly SqliteConnection _connection;
    public IServiceProvider ServiceProvider { get; }

    public TestDatabaseFixture()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var services = new ServiceCollection();

        // Logging so DataSeeder can log
        services.AddLogging(builder => builder.AddDebug());

        services.AddDbContext<PortManagementContext>(options =>
            options.UseSqlite(_connection));

        ServiceProvider = services.BuildServiceProvider();

        using (var scope = ServiceProvider.CreateScope())
        {
            var scopedProvider = scope.ServiceProvider;
            var context = scopedProvider.GetRequiredService<PortManagementContext>();

            context.Database.EnsureCreated();

            var logger = scopedProvider
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("DataSeederTest");

            DataSeeder.SeedDomainDataAsync(context, logger)
                      .GetAwaiter().GetResult();
        }

        Options = ServiceProvider
            .GetRequiredService<DbContextOptions<PortManagementContext>>();
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}
