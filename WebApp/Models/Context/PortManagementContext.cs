using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Configurations;
using WebApp.Models.Domain.Users;
using System.Text.Json;
using WebApp.Models.Domain.StorageArea;
using PortManagement.Domain.Enums;

namespace WebApp.Models.Context
{
    public class PortManagementContext : IdentityDbContext<ApplicationUser>
    {
        public PortManagementContext(DbContextOptions<PortManagementContext> options)
            : base(options) { }

        // DbSets
        public DbSet<Qualification> Qualifications { get; set; } = default!;
        public DbSet<Staff> Staff { get; set; } = default!;
        public DbSet<QualificationLink> QualificationLinks { get; set; } = default!;
        public DbSet<Vessel> Vessels { get; set; } = default!;
        public DbSet<VesselType> VesselTypes { get; set; } = default!;
        public DbSet<Resource> Resources { get; set; } = default!;
        public DbSet<StorageArea> StorageAreas { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Apply entity configurations
            modelBuilder.ApplyConfiguration(new QualificationConfiguration());
            modelBuilder.ApplyConfiguration(new StaffConfiguration());
            modelBuilder.ApplyConfiguration(new VesselConfiguration());
            modelBuilder.ApplyConfiguration(new VesselTypeConfiguration());

            // Qualification link (many-to-many)
            modelBuilder.Entity<QualificationLink>()
                .HasKey(q => new { q.StaffId, q.QualificationId });

            modelBuilder.Entity<QualificationLink>()
                .HasOne<Staff>()
                .WithMany(s => s.Qualifications)
                .HasForeignKey(q => q.StaffId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QualificationLink>()
                .HasOne<Qualification>()
                .WithMany()
                .HasForeignKey(q => q.QualificationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Storage area hierarchy
            modelBuilder.Entity<StorageArea>(builder =>
            {
                builder.HasKey(sa => sa.Id);

                builder.Property(sa => sa.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                builder.Property(sa => sa.MaxCapacityTeu).IsRequired();
                builder.Property(sa => sa.CurrentOccupancyTeu).IsRequired();

                builder
                    .HasDiscriminator<StorageAreaType>("StorageAreaType")
                    .HasValue<Dock>(StorageAreaType.Dock)
                    .HasValue<ContainerYard>(StorageAreaType.ContainerYard)
                    .HasValue<Warehouse>(StorageAreaType.Warehouse);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
