using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class StorageAreaConfiguration : IEntityTypeConfiguration<StorageArea>
    {
        public void Configure(EntityTypeBuilder<StorageArea> builder)
        {
            builder.HasKey(sa => sa.Id);

            builder.Property(sa => sa.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(sa => sa.Type)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(sa => sa.MaxCapacityTeu)
                .IsRequired();

            builder.Property(sa => sa.CurrentOccupancyTeu)
                .IsRequired();
        }
    }
}