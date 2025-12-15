using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Oem.Models.Domain.OperationPlans;

namespace Oem.Models.Infrastructure.Persistence.EntityConfigurations
{
    public class OperationPlanItemConfiguration : IEntityTypeConfiguration<OperationPlanItem>
    {
        public void Configure(EntityTypeBuilder<OperationPlanItem> builder)
        {
            // 1. Table Name
            builder.ToTable("OperationPlanItems");

            // 2. Primary Key
            builder.HasKey(item => item.Id);

            // 3. Foreign Key Linking
            // (We defined the relationship in the Parent, but we ensure the FK column exists here)
            builder.Property(item => item.OperationPlanId)
                .IsRequired();

            // 4. Vessel Info (Snapshot)
            builder.Property(item => item.VesselVisitId)
                .IsRequired();

            builder.Property(item => item.VesselIMO)
                .IsRequired()
                .HasMaxLength(20); // IMO is usually 7 digits, but 20 is safe

            // 5. Time Windows
            builder.Property(item => item.ServiceStartTime).IsRequired();
            builder.Property(item => item.ServiceEndTime).IsRequired();
            
            // These might be nullable if something goes wrong, but ideally required
            builder.Property(item => item.LoadingStartTime).IsRequired();
            builder.Property(item => item.LoadingEndTime).IsRequired();
            builder.Property(item => item.UnloadingStartTime).IsRequired();
            builder.Property(item => item.UnloadingEndTime).IsRequired();

            // 6. Resources
            builder.Property(item => item.NumberOfCranes)
                .IsRequired();
        }
    }
}