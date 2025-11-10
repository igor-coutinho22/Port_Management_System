using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Models.Infrastructure.Configurations.Docks
{
    public class DockConfiguration : IEntityTypeConfiguration<Dock>
    {
        public void Configure(EntityTypeBuilder<Dock> builder)
        {
            builder.ToTable("Docks");
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(d => d.Location)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(d => d.LengthMeters).IsRequired();
            builder.Property(d => d.DepthMeters).IsRequired();
            builder.Property(d => d.MaxDraftMeters).IsRequired();

            // Many-to-many Dock <-> VesselType
            builder.HasMany(d => d.AllowedVesselTypes)
                   .WithMany()
                   .UsingEntity<Dictionary<string, object>>(
                        "DockVesselType",
                        j => j.HasOne<VesselType>()
                              .WithMany()
                              .HasForeignKey("VesselTypeId")
                              .OnDelete(DeleteBehavior.Cascade),
                        j => j.HasOne<Dock>()
                              .WithMany()
                              .HasForeignKey("DockId")
                              .OnDelete(DeleteBehavior.Cascade)
                   );
        }
    }
}