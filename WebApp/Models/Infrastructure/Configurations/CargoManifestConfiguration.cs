using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Configurations.VesselVisits
{
    public class CargoManifestConfiguration : IEntityTypeConfiguration<CargoManifest>
    {
        public void Configure(EntityTypeBuilder<CargoManifest> builder)
        {
            builder.ToTable("CargoManifests");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Type)
                   .IsRequired()
                   .HasConversion<string>();

            // Relationship — 1:N with Containers
            builder.HasMany(m => m.Containers)
                   .WithOne()
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
