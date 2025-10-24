using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class DockStorageAreaInfoConfiguration : IEntityTypeConfiguration<DockStorageAreaInfo>
    {
        public void Configure(EntityTypeBuilder<DockStorageAreaInfo> builder)
        {
            builder.HasKey(d => d.Id);

            builder.Property(d => d.DistanceMeters).IsRequired();
            builder.Property(d => d.TravelSeconds).IsRequired();

            builder.HasIndex(d => new { d.StorageAreaId, d.DockId }).IsUnique();
            
            // Relationship to StorageArea
            builder.HasOne<WebApp.Models.Domain.StorageArea.StorageArea>()
                .WithMany("DockConnections")
                .HasForeignKey(d => d.StorageAreaId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
