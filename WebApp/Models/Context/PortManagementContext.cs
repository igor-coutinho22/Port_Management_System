using Microsoft.EntityFrameworkCore;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Configurations;

namespace WebApp.Models.Context
{
    public class PortManagementContext : DbContext
    {
        public PortManagementContext(DbContextOptions<PortManagementContext> options)
            : base(options) { }

        // tabelas (DbSet)
        public DbSet<Qualification> Qualifications { get; set; } = default!;
        public DbSet<Staff> Staff { get; set; } = default!;
        public DbSet<QualificationLink> QualificationLinks { get; set; } = default!;
        public DbSet<Vessel> Vessels { get; set; } = default!;
        public DbSet<VesselType> VesselTypes { get; set; } = default!;
        public DbSet<Resource> Resources { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Entidades
            modelBuilder.ApplyConfiguration(new QualificationConfiguration());
            modelBuilder.ApplyConfiguration(new StaffConfiguration());
            modelBuilder.ApplyConfiguration(new VesselConfiguration());
            modelBuilder.ApplyConfiguration(new VesselTypeConfiguration());

            // Key para a tabela de ligação (many-to-many)
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

            modelBuilder.Entity<Vessel>()
                .HasOne(v => v.VesselType)
                .WithMany()
                .HasForeignKey("VesselTypeName")
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VesselType>().HasData(
                VesselType.Feeder,
                VesselType.Panamax,
                VesselType.PostPanamax,
                VesselType.ULCVessel);

            base.OnModelCreating(modelBuilder);
        }
    }
}