// File: WebApp/Models/Infrastructure/Configurations/RepresentativeConfiguration.cs
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
            
            b.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(120);
                
            b.Property(x => x.CitizenId)
                .IsRequired()
                .HasMaxLength(64);
                
            b.Property(x => x.Nationality)
                .IsRequired()
                .HasMaxLength(3);
                
            b.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(200);
                
            b.Property(x => x.Phone)
                .IsRequired()
                .HasMaxLength(32);

            // Unique constraints within organization
            b.HasIndex(x => new { x.OrganizationId, x.Email }).IsUnique();
            b.HasIndex(x => new { x.OrganizationId, x.CitizenId }).IsUnique();

            // Relationships
            b.HasOne(r => r.Organization)
             .WithMany(o => o.Representatives)
             .HasForeignKey(r => r.OrganizationId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }
}