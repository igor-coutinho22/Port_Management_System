using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Oem.Models.Domain.OperationPlans;

namespace Oem.Models.Infrastructure.Persistence.EntityConfigurations
{
    public class OperationPlanConfiguration : IEntityTypeConfiguration<OperationPlan>
    {
        public void Configure(EntityTypeBuilder<OperationPlan> builder)
        {
            // 1. Table Name
            builder.ToTable("OperationPlans");

            // 2. Primary Key
            builder.HasKey(op => op.Id);

            // 3. Properties
            builder.Property(op => op.ScheduleDate)
                .IsRequired();

            builder.Property(op => op.HeuristicUsed)
                .IsRequired()
                .HasMaxLength(50); // ex: "fcfs", "priority_v1"

            builder.Property(op => op.TotalDelayMinutes)
                .IsRequired();

            builder.Property(op => op.AlgorithmRuntimeSeconds)
                .IsRequired();

            builder.Property(op => op.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP"); // Auto-set date on insert

            // 4. Enum Conversion (Store as String for readability in DB)
            builder.Property(op => op.Status)
                .HasConversion<string>() 
                .HasMaxLength(20)
                .IsRequired();

            // 5. Relationship (One-to-Many)
            // A Plan has many Items. If the Plan is deleted, the Items are deleted (Cascade).
            builder.HasMany(op => op.Items)
                .WithOne() // No navigation property back to Plan in Item class needed implies .WithOne()
                .HasForeignKey(item => item.OperationPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}