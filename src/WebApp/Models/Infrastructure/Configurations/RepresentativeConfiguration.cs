using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class RepresentativeConfiguration : IEntityTypeConfiguration<Representative>
    {
        public void Configure(EntityTypeBuilder<Representative> b)
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).IsRequired().HasMaxLength(120);
            b.Property(x => x.CitizenId).IsRequired().HasMaxLength(64);
            b.Property(x => x.Nationality).IsRequired().HasMaxLength(3);
            b.Property(x => x.Email).IsRequired().HasMaxLength(200);
            b.Property(x => x.Phone).IsRequired().HasMaxLength(32);

            // Evita emails repetidos dentro da mesma org (alinhado com teu uso de índices únicos em Qualification.Code)
            b.HasIndex(x => new { x.OrganizationId, x.Email }).IsUnique();
        }
    }
}
