using Microsoft.EntityFrameworkCore;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Infrastructure.Persistence.EntityConfigurations;

namespace Oem.Models.Context
{
    public class OemContext : DbContext
    {
        public OemContext(DbContextOptions<OemContext> options)
            : base(options) { }

        //DbSets
        public DbSet<OperationPlan> OperationPlans { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new OperationPlanConfiguration());
            modelBuilder.ApplyConfiguration(new OperationPlanItemConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}