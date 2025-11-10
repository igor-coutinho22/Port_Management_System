using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Qualifications;

public class ResourceConfiguration : IEntityTypeConfiguration<Resource>
{
    public void Configure(EntityTypeBuilder<Resource> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.OperationalCapacity)
            .IsRequired();

        builder.Property(r => r.SetupTime)
            .IsRequired();

        // ⚙️ Map the relationship Resource -> Qualification (unidirectional)
        builder
            .HasMany(r => r.QualificationRequirements)
            .WithMany() // no navigation on Qualification
            .UsingEntity<Dictionary<string, object>>(
                "ResourceQualificationRequirement",
                j => j
                    .HasOne<Qualification>()
                    .WithMany()
                    .HasForeignKey("QualificationCode")
                    .HasPrincipalKey(q => q.Code)
                    .OnDelete(DeleteBehavior.Restrict),
                j => j
                    .HasOne<Resource>()
                    .WithMany()
                    .HasForeignKey("ResourceId")
                    .HasPrincipalKey(r => r.Id)
                    .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("ResourceId", "QualificationCode");
                    j.ToTable("ResourceQualificationRequirements");
                });
    }
}
