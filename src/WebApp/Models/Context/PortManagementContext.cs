using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Configurations;
using WebApp.Models.Domain.Users;
using WebApp.Models.Domain.StorageArea;
using PortManagement.Domain.Enums;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Infrastructure.Configurations.VesselVisits;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Infrastructure.Configurations.Docks;

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
        public DbSet<VesselVisitNotification> VesselVisitNotifications { get; set; } = default!;
        public DbSet<CargoManifest> CargoManifests { get; set; } = default!;
        public DbSet<Container> Containers { get; set; } = default!;
        public DbSet<CrewMember> CrewMembers { get; set; } = default!;
        public DbSet<DockStorageAreaConnection> DockStorageAreaConnections { get; set; } = default!;
        public DbSet<ShippingAgentOrganization> Organizations { get; set; } = default!;
        public DbSet<Representative> Representatives { get; set; } = default!;
        public DbSet<Dock> Docks { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new QualificationConfiguration());
            modelBuilder.ApplyConfiguration(new StaffConfiguration());
            modelBuilder.ApplyConfiguration(new VesselConfiguration());
            modelBuilder.ApplyConfiguration(new VesselTypeConfiguration());
            modelBuilder.ApplyConfiguration(new OrganizationConfiguration());
            modelBuilder.ApplyConfiguration(new RepresentativeConfiguration());
            modelBuilder.ApplyConfiguration(new VesselVisitNotificationConfiguration());
            modelBuilder.ApplyConfiguration(new CargoManifestConfiguration());
            modelBuilder.ApplyConfiguration(new ContainerConfiguration());
            modelBuilder.ApplyConfiguration(new CrewMemberConfiguration());
            modelBuilder.ApplyConfiguration(new DockStorageAreaConnectionConfiguration());
            modelBuilder.ApplyConfiguration(new DockConfiguration());
            modelBuilder.ApplyConfiguration(new QualificationLinkConfiguration());

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
                    .HasValue<ContainerYard>(StorageAreaType.ContainerYard)
                    .HasValue<Warehouse>(StorageAreaType.Warehouse);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
