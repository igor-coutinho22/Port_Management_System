using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Containers;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Configurations.VesselVisits
{
    public class ContainerConfiguration : IEntityTypeConfiguration<Container>
    {
        public void Configure(EntityTypeBuilder<Container> builder)
        {
            builder.ToTable("Containers");

            builder.HasKey(c => c.Identifier);

            builder.Property(c => c.Identifier)
                   .HasMaxLength(11)
                   .IsRequired();
        }
    }
}
