using Microsoft.EntityFrameworkCore;

namespace Oem.Models.Context
{
    public class OemContext : DbContext
    {
        public OemContext(DbContextOptions<OemContext> options) : base(options)
        {
        }

        // Define ONLY the new Sprint C tables here
        // public DbSet<OperationPlan> OperationPlans { get; set; }
        // public DbSet<Incident> Incidents { get; set; }
        // public DbSet<VesselVisitExecution> VesselVisitExecutions { get; set; }
    }
}