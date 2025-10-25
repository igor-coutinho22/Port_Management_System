using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class QualificationConfiguration : IEntityTypeConfiguration<Qualification>
    {
        public void Configure(EntityTypeBuilder<Qualification> builder)
        {
            builder.HasKey(q => q.Code);

            builder.Property(q => q.Code)
                .HasMaxLength(50);

            builder.Property(q => q.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder
                .HasMany(q => q.QualificationLinks)
                .WithOne(ql => ql.Qualification)
                .HasForeignKey(ql => ql.QualificationCode)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
