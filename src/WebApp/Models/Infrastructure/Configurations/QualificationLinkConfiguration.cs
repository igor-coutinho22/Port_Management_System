using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class QualificationLinkConfiguration : IEntityTypeConfiguration<QualificationLink>
    {
        public void Configure(EntityTypeBuilder<QualificationLink> builder)
        {
            builder.HasKey(q => new { q.StaffMecanographicNumber, q.QualificationCode });

            builder.HasOne(q => q.Staff)
                .WithMany(s => s.QualificationLinks)
                .HasForeignKey(q => q.StaffMecanographicNumber)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(q => q.Qualification)
                .WithMany(qf => qf.QualificationLinks)
                .HasForeignKey(q => q.QualificationCode)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
