using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddDockStorageAreaConnections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DockStorageAreaInfos");

            migrationBuilder.AddColumn<int>(
                name: "Purpose",
                table: "VesselVisitNotifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "AlternativeNames",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "DecisionLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OfficerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Outcome = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VesselVisitNotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DecisionLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DecisionLog_VesselVisitNotifications_VesselVisitNotificationId",
                        column: x => x.VesselVisitNotificationId,
                        principalTable: "VesselVisitNotifications",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DockStorageAreaConnections",
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
                    table.PrimaryKey("PK_DockStorageAreaConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DockStorageAreaConnections_StorageAreas_StorageAreaId",
                        column: x => x.StorageAreaId,
                        principalTable: "StorageAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DecisionLog_VesselVisitNotificationId",
                table: "DecisionLog",
                column: "VesselVisitNotificationId");

            migrationBuilder.CreateIndex(
                name: "IX_DockStorageAreaConnections_StorageAreaId_DockId",
                table: "DockStorageAreaConnections",
                columns: new[] { "StorageAreaId", "DockId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DecisionLog");

            migrationBuilder.DropTable(
                name: "DockStorageAreaConnections");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "VesselVisitNotifications");

            migrationBuilder.AlterColumn<string>(
                name: "AlternativeNames",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "DockStorageAreaInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DistanceMeters = table.Column<double>(type: "float", nullable: false),
                    DockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StorageAreaId = table.Column<int>(type: "int", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_DockStorageAreaInfos_StorageAreaId_DockId",
                table: "DockStorageAreaInfos",
                columns: new[] { "StorageAreaId", "DockId" },
                unique: true);
        }
    }
}
