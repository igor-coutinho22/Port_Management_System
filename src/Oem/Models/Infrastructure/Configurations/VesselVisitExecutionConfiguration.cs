using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Oem.Models.Domain.VesselVisitExecutions;

namespace Oem.Models.Infrastructure.Persistence.EntityConfigurations
{
    public class VesselVisitExecutionConfiguration : IEntityTypeConfiguration<VesselVisitExecution>
    {
        public void Configure(EntityTypeBuilder<VesselVisitExecution> builder)
        {
            builder.ToTable("VesselVisitExecutions");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.VesselIdentifier)
                .IsRequired();

            builder.Property(e => e.Status)
                .IsRequired();
            
            builder.Property(e => e.CreatedBy)
                .IsRequired();
        }
    }
}
