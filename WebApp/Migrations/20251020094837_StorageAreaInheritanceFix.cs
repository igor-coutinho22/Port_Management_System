using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class StorageAreaInheritanceFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "VesselTypes",
                keyColumn: "Name",
                keyValue: "Feeder");

            migrationBuilder.DeleteData(
                table: "VesselTypes",
                keyColumn: "Name",
                keyValue: "Panamax");

            migrationBuilder.DeleteData(
                table: "VesselTypes",
                keyColumn: "Name",
                keyValue: "Post-Panamax");

            migrationBuilder.DeleteData(
                table: "VesselTypes",
                keyColumn: "Name",
                keyValue: "Ultra Large Container Vessel (ULCV)");

            migrationBuilder.CreateTable(
                name: "StorageAreas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    MaxCapacityTeu = table.Column<int>(type: "int", nullable: false),
                    CurrentOccupancyTeu = table.Column<int>(type: "int", nullable: false),
                    StorageAreaType = table.Column<int>(type: "int", nullable: false),
                    FixedStsCranesCount = table.Column<int>(type: "int", nullable: true),
                    MaxVesselLengthMeters = table.Column<int>(type: "int", nullable: true),
                    ContainerYardId = table.Column<int>(type: "int", nullable: true),
                    SpecializedCargoType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageAreas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageAreas_StorageAreas_ContainerYardId",
                        column: x => x.ContainerYardId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Distance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromStorageAreaId = table.Column<int>(type: "int", nullable: false),
                    ToStorageAreaId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<double>(type: "float", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Distance_StorageAreas_FromStorageAreaId",
                        column: x => x.FromStorageAreaId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Distance_StorageAreas_ToStorageAreaId",
                        column: x => x.ToStorageAreaId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Distance_FromStorageAreaId",
                table: "Distance",
                column: "FromStorageAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Distance_ToStorageAreaId",
                table: "Distance",
                column: "ToStorageAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_StorageAreas_ContainerYardId",
                table: "StorageAreas",
                column: "ContainerYardId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Distance");

            migrationBuilder.DropTable(
                name: "StorageAreas");

            migrationBuilder.InsertData(
                table: "VesselTypes",
                columns: new[] { "Name", "Description", "MaxBays", "MaxRows", "MaxTiers" },
                values: new object[,]
                {
                    { "Feeder", "Feeder vessels are smaller container ships that typically operate on regional routes, transporting containers to and from larger hub ports. They usually have a capacity ranging from 100 to 3,000 TEUs (Twenty-Foot Equivalent Units). Feeder vessels are designed to navigate shallower waters and smaller ports that larger vessels cannot access.", 8, 8, 4 },
                    { "Panamax", "Panamax vessels are designed to fit through the original locks of the Panama Canal. They typically have a maximum length of about 294 meters (965 feet), a beam (width) of 32.3 meters (106 feet), and a draft (depth) of 12.04 meters (39.5 feet). Panamax vessels can carry around 4,500 to 5,000 TEUs (Twenty-Foot Equivalent Units).", 12, 10, 6 },
                    { "Post-Panamax", "Post-Panamax vessels are larger than Panamax vessels and are designed to exceed the size limitations of the original Panama Canal locks. They typically have a maximum length of about 366 meters (1,200 feet), a beam (width) of 49 meters (160 feet), and a draft (depth) of 15.2 meters (50 feet). Post-Panamax vessels can carry around 10,000 to 13,000 TEUs (Twenty-Foot Equivalent Units).", 14, 12, 7 },
                    { "Ultra Large Container Vessel (ULCV)", "Ultra Large Container Vessels (ULCVs) are among the largest container ships in the world, designed to maximize cargo capacity for long-haul routes. They typically have a maximum length of about 400 meters (1,312 feet), a beam (width) of 59 meters (194 feet), and a draft (depth) of 16 meters (52 feet). ULCVs can carry over 20,000 TEUs (Twenty-Foot Equivalent Units), making them highly efficient for transporting large volumes of goods across oceans.", 24, 20, 10 }
                });
        }
    }
}
