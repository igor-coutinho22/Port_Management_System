using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Users;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Domain.Vessels;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;
using StorageAreaBase = WebApp.Models.Domain.StorageArea.StorageArea;
using System.Collections.Generic; // for List<T>

namespace WebApp.Seeding
{
    public static class DataSeeder
    {

        public static async Task SeedDomainDataAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PortManagementContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");

            if (context.Database.IsRelational())
                await context.Database.MigrateAsync();

            // === QUALIFICATIONS ===
            if (!await context.Set<Qualification>().AnyAsync())
            {
                var qualifications = new List<Qualification>
                {
                    new("Q1", "Crane Operator License"),
                    new("Q2", "Heavy Vehicle Driver's License"),
                    new("Q3", "Hazardous Cargo Handling"),
                    new("Q4","Driver's License")
                };

                await context.AddRangeAsync(qualifications);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Qualifications.", qualifications.Count);
            }

            // === RESOURCES ===
            if (!await context.Set<Resource>().AnyAsync())
            {
                var allQualifications = await context.Set<Qualification>().ToListAsync();

                var resources = new List<Resource>
                {
                    new("R001", "STS Crane #1",
                        ResourceType.STSCrane,
                        operationalCapacity: 60,
                        status: ResourceAvailabilityStatus.Active,
                        setupTime: 120,
                        qualifications: new HashSet<Qualification> { allQualifications[0], allQualifications[2] }),

                    new("R002", "Yard Crane #1",
                        ResourceType.YardCrane,
                        operationalCapacity: 40,
                        status: ResourceAvailabilityStatus.Active,
                        setupTime: 40,
                        qualifications: new HashSet<Qualification> { allQualifications[0] }),

                    new("R003", "Truck #1",
                        ResourceType.Truck,
                        operationalCapacity: 20,
                        status: ResourceAvailabilityStatus.UnderMaintenance,
                        setupTime: 5,
                        qualifications: new HashSet<Qualification> { allQualifications[3] })
                };

                await context.AddRangeAsync(resources);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Resources.", resources.Count);
            }

            // === STAFF ===
            if (!await context.Set<Staff>().AnyAsync())
            {
                var qualifications = await context.Set<Qualification>().ToListAsync();

                var staffMembers = new List<Staff>
                {
                    new("S001", "Alice", "alice@port.pt", "911111111",
                        StaffStatus.Available, "06:00-14:00"),

                    new("S002", "Bruno", "bruno@port.pt", "922222222",
                        StaffStatus.Unavailable, "14:00-22:00"),

                    new("S003", "Carla", "carla@port.pt", "933333333",
                        StaffStatus.Available, "06:00-14:00")
                };

                await context.AddRangeAsync(staffMembers);
                await context.SaveChangesAsync();

                // Assign qualifications via QualificationLink
                var qualificationLinks = new List<QualificationLink>
                {
                    new QualificationLink("S001", "Q1", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-2))),
                    new QualificationLink("S002", "Q2", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1))),
                    new QualificationLink("S003", "Q3", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-3))),
                    new QualificationLink("S003", "Q1", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-2)))
                };

                await context.AddRangeAsync(qualificationLinks);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeded {Count} Staff Members and {Count2} Qualification Links.",
                    staffMembers.Count, qualificationLinks.Count);
            }

            // === ORGANIZATIONS & REPRESENTATIVES ===
            if (!await context.Organizations.AnyAsync())
            {
                // Organization 1
                var org1 = new ShippingAgentOrganization(
                    identifier: "MSC-PT - Mediterranean Shipping Company Portugal",
                    legalName: "Atlantic Shipping SA",
                    alternativeNames: "Atlantic; ASL",
                    address: "Av. do Porto 100, 4050-123 Porto, PT",
                    taxNumber: "1-0001"
                );

                var rep1 = new Representative(
                    org1.Id,
                    name: "Ana Martins",
                    citizenId: "CITPT001",
                    nationality: "PRT",
                    email: "ana.martins@atlantic.com",
                    phone: "+351912345678"
                );

                var rep2 = new Representative(
                    org1.Id,
                    name: "Miguel Sousa",
                    citizenId: "CITPT002",
                    nationality: "PRT",
                    email: "miguel.sousa@atlantic.com",
                    phone: "+351913000111"
                );

                org1.AddRepresentative(rep1);
                org1.AddRepresentative(rep2);

                // Organization 2
                var org2 = new ShippingAgentOrganization(
                    identifier: "BOL-DE - BlueOcean Logistics Germany",
                    legalName: "BlueOcean Logistics GmbH",
                    alternativeNames: "BlueOcean; BOL",
                    address: "Hafenstrasse 12, 20457 Hamburg, DE",
                    taxNumber: "2-2025"
                );

                var rep3 = new Representative(
                    org2.Id,
                    name: "Jonas Weber",
                    citizenId: "DEID2025X",
                    nationality: "DEU",
                    email: "jonas.weber@blueocean.de",
                    phone: "+49401234567"
                );

                var rep4 = new Representative(
                    org2.Id,
                    name: "Laura Klein",
                    citizenId: "DEID2025Y",
                    nationality: "DEU",
                    email: "laura.klein@blueocean.de",
                    phone: "+49407654321"
                );

                org2.AddRepresentative(rep3);
                org2.AddRepresentative(rep4);

                // Guardar no contexto
                await context.Organizations.AddRangeAsync(org1, org2);
                await context.Representatives.AddRangeAsync(rep1, rep2, rep3, rep4);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeded {Count} Organizations and {Count2} Representatives.",
                    2, 4);
            }

            // === VESSEL TYPES ===
            if (!await context.Set<VesselType>().AnyAsync())
            {
                var vesselTypes = new List<VesselType>
                {
                    new("Container Ship", "Large container vessel for international shipping", 20, 18, 8),
                    new("Bulk Carrier", "Vessel designed for transporting bulk cargo", 15, 12, 6),
                    new("Tanker", "Vessel for liquid cargo transport", 18, 10, 4),
                    new("RoRo Ship", "Roll-on/roll-off vessel for vehicles and trailers", 12, 15, 3)
                };

                await context.AddRangeAsync(vesselTypes);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Vessel Types.", vesselTypes.Count);
            }

            // === DOCKS ===
            if (!await context.Set<Dock>().AnyAsync())
            {
                var vesselTypes = await context.Set<VesselType>().ToListAsync();

                var docks = new List<Dock>
                {
                    new("Dock A", "North Terminal", 300.0, 15.0, 12.0, 
                        new List<VesselType> { vesselTypes[0], vesselTypes[2] }), // Container Ship, Tanker
                    
                    new("Dock B", "South Terminal", 250.0, 12.0, 10.0, 
                        new List<VesselType> { vesselTypes[1], vesselTypes[3] }), // Bulk Carrier, RoRo Ship
                    
                    new("Dock C", "East Terminal", 400.0, 18.0, 15.0, 
                        new List<VesselType> { vesselTypes[0], vesselTypes[1], vesselTypes[2] }) // Multi-purpose
                };

                await context.AddRangeAsync(docks);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Docks.", docks.Count);
            }

            // === VESSELS ===
            if (!await context.Set<Vessel>().AnyAsync())
            {
                var vesselTypes = await context.Set<VesselType>().ToListAsync();

                var vessels = new List<Vessel>
                {
                    new("6268446", "Atlantic Carrier", "Atlantic Shipping SA", vesselTypes[0], 12, 9, 2, 4, 280.0),
                    new("2221610", "Baltic Bulk", "Nordic Logistics", vesselTypes[1], 9, 7, 1, 2, 220.0),
                    new("8666692", "Mediterranean Express", "BlueOcean Logistics GmbH", vesselTypes[0], 8, 6, 3, 6, 350.0),
                    new("0260090", "Iberian Tanker", "Iberian Maritime", vesselTypes[2], 4, 8, 3, 3, 2001.0)
                };

                await context.AddRangeAsync(vessels);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Vessels.", vessels.Count);
            }
            
            // === STORAGE AREAS ===
            if (!await context.Set<StorageAreaBase>().AnyAsync())
            {
                var docks = await context.Set<Dock>().ToListAsync();

                var storageAreas = new List<StorageAreaBase>
                {
                    // Warehouses
                    new Warehouse("Warehouse North", 500, 150, "Perishable"),
                    new Warehouse("Warehouse South", 300, 80, "Hazardous"),
                    new Warehouse("Warehouse Central", 400, 200, "General"),

                    // Container Yards
                    new ContainerYard("Container Yard North", 1000, 350, new List<Dock> { docks[0] }),
                    new ContainerYard("Container Yard South", 800, 200, new List<Dock> { docks[1] }),
                    new ContainerYard("Container Yard Central", 1200, 600, new List<Dock> { docks[0], docks[2] })
                };

                await context.AddRangeAsync(storageAreas);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} Storage Areas (Warehouses and Container Yards).", storageAreas.Count);
            }



            // === VESSEL VISIT NOTIFICATIONS ===
            if (!await context.Set<VesselVisitNotification>().AnyAsync())
            {
                var vessels = await context.Set<Vessel>().ToListAsync();
                var docks = await context.Set<Dock>().ToListAsync();

                if (vessels.Count >= 4 && docks.Count >= 2)
                {
                    var v1 = vessels[0].IMO;
                    var v2 = vessels[1].IMO;
                    var v3 = vessels[2].IMO;
                    var v4 = vessels[3].IMO;

                    var dock1 = docks[0].Id;
                    var dock2 = docks[1].Id;

                    var targetDay = DateTime.UtcNow.Date.AddDays(0);

                    // ===== Visit 1: Commercial, loading + unloading, early slot =====
                    var visit1 = new VesselVisitNotification(v1, dock1, targetDay, VisitPurpose.Commercial);

                    visit1.AddCrewMember(new CrewMember("John Doe", "C1234", "PT"));

                    var loadingManifest1 = new CargoManifest(CargoManifestType.Loading);
                    // VALID ISO 6346 IDs
                    loadingManifest1.AddContainer(new Container("MSCU1000001"));
                    visit1.AddLoadingManifest(loadingManifest1);

                    var unloadingManifest1 = new CargoManifest(CargoManifestType.Unloading);
                    unloadingManifest1.AddContainer(new Container("MSCU1000017"));
                    visit1.AddUnloadingManifest(unloadingManifest1);

                    visit1.UpdateScheduleWindow(
                        arrivalTime: targetDay.AddHours(6),          // 06:00
                        desiredDepartureTime: targetDay.AddHours(10) // 10:00
                    );
                    visit1.UpdateEstimatedDurations(
                        loadingMinutes: 60,
                        unloadingMinutes: 45
                    );
                    visit1.MarkAsSubmitted();
                    _ = visit1.Approve();

                    // ===== Visit 2: Commercial, mostly loading, mid-day =====
                    var visit2 = new VesselVisitNotification(v2, dock1, targetDay, VisitPurpose.Commercial);
                    visit2.AddCrewMember(new CrewMember("Maria Silva", "C4567", "ES"));

                    var loadingManifest2 = new CargoManifest(CargoManifestType.Loading);
                    loadingManifest2.AddContainer(new Container("MSCU1000022"));
                    loadingManifest2.AddContainer(new Container("MSCU1000038"));
                    visit2.AddLoadingManifest(loadingManifest2);

                    visit2.UpdateScheduleWindow(
                        arrivalTime: targetDay.AddHours(11),          // 11:00
                        desiredDepartureTime: targetDay.AddHours(15)  // 15:00
                    );
                    visit2.UpdateEstimatedDurations(
                        loadingMinutes: 90,
                        unloadingMinutes: 0
                    );
                    visit2.MarkAsSubmitted();
                    _ = visit2.Approve();

                    // ===== Visit 3: Commercial, unloading only, afternoon =====
                    var visit3 = new VesselVisitNotification(v3, dock2, targetDay, VisitPurpose.Commercial);
                    visit3.AddCrewMember(new CrewMember("Carlos Mendes", "C78910", "BR"));

                    var unloadingManifest3 = new CargoManifest(CargoManifestType.Unloading);
                    unloadingManifest3.AddContainer(new Container("MSCU1000043"));
                    visit3.AddUnloadingManifest(unloadingManifest3);

                    visit3.UpdateScheduleWindow(
                        arrivalTime: targetDay.AddHours(13),          // 13:00
                        desiredDepartureTime: targetDay.AddHours(18)  // 18:00
                    );
                    visit3.UpdateEstimatedDurations(
                        loadingMinutes: 0,
                        unloadingMinutes: 120
                    );
                    visit3.MarkAsSubmitted();
                    _ = visit3.Approve();

                    // ===== Visit 4: Commercial, both ops, tight window =====
                    var visit4 = new VesselVisitNotification(v4, dock2, targetDay, VisitPurpose.Commercial);
                    visit4.AddCrewMember(new CrewMember("Eva Liu", "C9999", "CN"));

                    var loadingManifest4 = new CargoManifest(CargoManifestType.Loading);
                    loadingManifest4.AddContainer(new Container("MSCU1000059"));
                    visit4.AddLoadingManifest(loadingManifest4);

                    var unloadingManifest4 = new CargoManifest(CargoManifestType.Unloading);
                    unloadingManifest4.AddContainer(new Container("MSCU1000064"));
                    visit4.AddUnloadingManifest(unloadingManifest4);

                    visit4.UpdateScheduleWindow(
                        arrivalTime: targetDay.AddHours(9),           // 09:00
                        desiredDepartureTime: targetDay.AddHours(12)  // 12:00
                    );
                    visit4.UpdateEstimatedDurations(
                        loadingMinutes: 40,
                        unloadingMinutes: 30
                    );
                    visit4.MarkAsSubmitted();
                    _ = visit4.Approve();

                    await context.AddRangeAsync(visit1, visit2, visit3, visit4);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Seeded 4 schedulable Vessel Visit Notifications with valid ISO 6346 containers.");
                }
                else
                {
                    logger.LogWarning(
                        "Cannot seed Vessel Visit Notifications: insufficient vessels ({VesselCount}) or docks ({DockCount}).",
                        vessels.Count, docks.Count
                    );
                }
            }
        }
    }
}