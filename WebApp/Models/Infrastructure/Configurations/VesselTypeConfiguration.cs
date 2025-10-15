using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class VesselTypeConfiguration : IEntityTypeConfiguration<VesselType>
    {
        public void Configure(EntityTypeBuilder<VesselType> builder)
        {
            // Primary Key
            builder.HasKey(vt => vt.Name);

            // Properties
            builder.Property(vt => vt.Name)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(vt => vt.Description)
                .HasMaxLength(1000);

            builder.Property(vt => vt.MaxBays)
                .IsRequired();

            builder.Property(vt => vt.MaxRows)
                .IsRequired();

            builder.Property(vt => vt.MaxTiers)
                .IsRequired();

            // Optional: pre-seed the known vessel types
            builder.HasData(
                VesselType.Feeder,
                VesselType.Panamax,
                VesselType.PostPanamax,
                VesselType.ULCVessel
            );
        }
    }
}
