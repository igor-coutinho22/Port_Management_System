using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class QualificationConfiguration : IEntityTypeConfiguration<Qualification>
    {
        public void Configure(EntityTypeBuilder<Qualification> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.Code)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(q => q.Code)
                .IsUnique();

            builder.Property(q => q.Name)
                .IsRequired()
                .HasMaxLength(200);
        }
    }
}
