using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.ComponentModel;
using System.Text.Json;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class VesselConfiguration : IEntityTypeConfiguration<Vessel>
    {
        public void Configure(EntityTypeBuilder<Vessel> builder)
        {
            // Primary Key
            builder.HasKey(static v => v.IMO);

            // Properties
            builder.Property(static v => v.IMO)
                .IsRequired()
                .HasMaxLength(7);

            builder.Property(static v => v.VesselName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(static v => v.OperatorName)
                .HasMaxLength(150);

            builder.Property(static v => v.RequiredCraneCount)
                .IsRequired();

            builder.Property(static v => v.RequiredDockLength)
                .IsRequired();

            builder.Property(static v => v.Bays)
                .IsRequired();

            builder.Property(static v => v.Rows)
                .IsRequired();

            builder.Property(static v => v.Tiers)
                .IsRequired();

            // Navigation: VesselType
            builder.HasOne(v => v.VesselType)
                .WithMany()
                .HasForeignKey(v => v.VesselTypeName)
                .HasPrincipalKey(vt => vt.Name)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
                
        }
    }
}
