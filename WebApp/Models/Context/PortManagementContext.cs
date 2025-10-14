using Microsoft.EntityFrameworkCore;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Context
{
    public class PortManagementContext : DbContext
    {
        public PortManagementContext(DbContextOptions<PortManagementContext> options)
            : base(options) { }

        public DbSet<Qualification> Qualifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(PortManagementContext).Assembly);
        }
    }
}
