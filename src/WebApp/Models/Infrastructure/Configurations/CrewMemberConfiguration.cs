using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Configurations.VesselVisits
{
    public class CrewMemberConfiguration : IEntityTypeConfiguration<CrewMember>
    {
        public void Configure(EntityTypeBuilder<CrewMember> builder)
        {
            builder.ToTable("CrewMembers");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(c => c.CitizenId)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(c => c.Nationality)
                   .HasMaxLength(50)
                   .IsRequired();
        }
    }
}
