using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class VesselConfiguration : IEntityTypeConfiguration<Vessel>
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public void Configure(EntityTypeBuilder<Vessel> builder)
        {

            builder.HasKey(v => v.IMO);

            builder.Property(v => v.IMO)
                .IsRequired()
                .HasMaxLength(7);

            builder.Property(v => v.VesselName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(v => v.OperatorName)
                .HasMaxLength(150);

            builder.Property(v => v.RequiredCraneCount)
                .IsRequired();

            builder.Property(v => v.RequiredDockLength)
                .IsRequired();

            builder.Property(v => v.Bays)
                .IsRequired();

            builder.Property(v => v.Rows)
                .IsRequired();

            builder.Property(v => v.Tiers)
                .IsRequired();

            builder.Property(v => v.CargoGrid)
                .HasConversion(
                    grid => JsonSerializer.Serialize(grid, JsonOptions),
                    json => JsonSerializer.Deserialize<VesselGrid>(json, JsonOptions)
                            ?? new VesselGrid()
                )
                .Metadata.SetValueComparer(
                    new ValueComparer<VesselGrid>(
                        (a, b) => JsonSerializer.Serialize(a, JsonOptions)
                               == JsonSerializer.Serialize(b, JsonOptions),
                        v => JsonSerializer.Serialize(v, JsonOptions).GetHashCode(),
                        v => JsonSerializer.Deserialize<VesselGrid>(
                                JsonSerializer.Serialize(v, JsonOptions),
                                JsonOptions
                            )!
                    )
                );

            // SQL Server JSON storage
            builder.Property(v => v.CargoGrid)
            .HasColumnType("jsonb");


            builder.HasOne(v => v.VesselType)
                .WithMany()
                .HasForeignKey(v => v.VesselTypeName)
                .HasPrincipalKey(vt => vt.Name)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
