using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Infrastructure.Configurations
{
    public class StaffConfiguration : IEntityTypeConfiguration<Staff>
    {
        public void Configure(EntityTypeBuilder<Staff> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.MecanographicNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(s => s.ShortName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Email)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(s => s.Phone)
                .HasMaxLength(50);

            builder.Property(s => s.Status)
                .HasConversion<string>()
                .IsRequired();

            builder.OwnsOne(s => s.OperationalWindow);

            builder.HasMany(s => s.Qualifications)
                .WithOne()
                .HasForeignKey(q => q.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
