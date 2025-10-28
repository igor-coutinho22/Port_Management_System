using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Configurations.VesselVisits
{
    public class VesselVisitNotificationConfiguration : IEntityTypeConfiguration<VesselVisitNotification>
    {
        public void Configure(EntityTypeBuilder<VesselVisitNotification> builder)
        {
            builder.ToTable("VesselVisitNotifications");

            builder.HasKey(v => v.Id);

            builder.Property(v => v.VisitDate)
                   .IsRequired();

            builder.Property(v => v.Status)
                   .IsRequired()
                   .HasConversion<string>();

            builder.HasOne(vvn => vvn.Vessel)
                     .WithMany()
                     .HasForeignKey(vvn => vvn.VesselIMO)
                     .HasPrincipalKey(v => v.IMO)
                     .OnDelete(DeleteBehavior.Restrict);

            builder.Property(v => v.DockId).IsRequired();

            // Relationships — 1:1 optional with CargoManifests
            builder.HasOne(v => v.LoadingManifest)
                   .WithOne()
                   .HasForeignKey<CargoManifest>("LoadingManifestForId")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.UnloadingManifest)
                   .WithOne()
                   .HasForeignKey<CargoManifest>("UnloadingManifestForId")
                   .OnDelete(DeleteBehavior.Restrict);

            // One-to-many with CrewMembers
            builder.HasMany(v => v.Crew)
                   .WithOne()
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
