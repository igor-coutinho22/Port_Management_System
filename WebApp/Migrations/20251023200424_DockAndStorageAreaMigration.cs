using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class DockAndStorageAreaMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StorageAreas_StorageAreas_ContainerYardId",
                table: "StorageAreas");

            migrationBuilder.DropIndex(
                name: "IX_StorageAreas_ContainerYardId",
                table: "StorageAreas");

            migrationBuilder.DropColumn(
                name: "ContainerYardId",
                table: "StorageAreas");

            migrationBuilder.DropColumn(
                name: "FixedStsCranesCount",
                table: "StorageAreas");

            migrationBuilder.DropColumn(
                name: "MaxVesselLengthMeters",
                table: "StorageAreas");

            migrationBuilder.CreateTable(
                name: "Docks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LengthMeters = table.Column<double>(type: "float", nullable: false),
                    DepthMeters = table.Column<double>(type: "float", nullable: false),
                    MaxDraftMeters = table.Column<double>(type: "float", nullable: false),
                    ContainerYardId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Docks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Docks_StorageAreas_ContainerYardId",
                        column: x => x.ContainerYardId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DockStorageAreaInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StorageAreaId = table.Column<int>(type: "int", nullable: false),
                    DistanceMeters = table.Column<double>(type: "float", nullable: false),
                    TravelSeconds = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DockStorageAreaInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DockStorageAreaInfos_StorageAreas_StorageAreaId",
                        column: x => x.StorageAreaId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DockVesselType",
                columns: table => new
                {
                    DockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VesselTypeId = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DockVesselType", x => new { x.DockId, x.VesselTypeId });
                    table.ForeignKey(
                        name: "FK_DockVesselType_Docks_DockId",
                        column: x => x.DockId,
                        principalTable: "Docks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DockVesselType_VesselTypes_VesselTypeId",
                        column: x => x.VesselTypeId,
                        principalTable: "VesselTypes",
                        principalColumn: "Name",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Docks_ContainerYardId",
                table: "Docks",
                column: "ContainerYardId");

            migrationBuilder.CreateIndex(
                name: "IX_DockStorageAreaInfos_StorageAreaId_DockId",
                table: "DockStorageAreaInfos",
                columns: new[] { "StorageAreaId", "DockId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DockVesselType_VesselTypeId",
                table: "DockVesselType",
                column: "VesselTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DockStorageAreaInfos");

            migrationBuilder.DropTable(
                name: "DockVesselType");

            migrationBuilder.DropTable(
                name: "Docks");

            migrationBuilder.AddColumn<int>(
                name: "ContainerYardId",
                table: "StorageAreas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FixedStsCranesCount",
                table: "StorageAreas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxVesselLengthMeters",
                table: "StorageAreas",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StorageAreas_ContainerYardId",
                table: "StorageAreas",
                column: "ContainerYardId");

            migrationBuilder.AddForeignKey(
                name: "FK_StorageAreas_StorageAreas_ContainerYardId",
                table: "StorageAreas",
                column: "ContainerYardId",
                principalTable: "StorageAreas",
                principalColumn: "Id");
        }
    }
}
