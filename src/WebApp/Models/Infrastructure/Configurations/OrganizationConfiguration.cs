// File: WebApp/Models/Infrastructure/Configurations/OrganizationConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class OrganizationConfiguration : IEntityTypeConfiguration<ShippingAgentOrganization>
    {
        public void Configure(EntityTypeBuilder<ShippingAgentOrganization> b)
        {
            b.HasKey(x => x.Id);
            
            b.Property(x => x.Identifier)
                .IsRequired()
                .HasMaxLength(50);
                
            b.Property(x => x.LegalName)
                .IsRequired()
                .HasMaxLength(200);
                
            b.Property(x => x.AlternativeNames)
                .HasMaxLength(200);
                
            b.Property(x => x.Address)
                .IsRequired()
                .HasMaxLength(300);
                
            b.Property(x => x.TaxNumber)
                .IsRequired()
                .HasMaxLength(32);

            // Unique constraints
            b.HasIndex(x => x.Identifier).IsUnique();
            b.HasIndex(x => x.TaxNumber).IsUnique();
            b.HasIndex(x => x.LegalName).IsUnique();
            b.HasIndex(x => x.AlternativeNames).IsUnique();

            // Relationships
            b.HasMany(x => x.Representatives)
             .WithOne(r => r.Organization)
             .HasForeignKey(r => r.OrganizationId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }
}