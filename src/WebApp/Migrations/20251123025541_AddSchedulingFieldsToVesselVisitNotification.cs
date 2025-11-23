using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddSchedulingFieldsToVesselVisitNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivalTime",
                table: "VesselVisitNotifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DesiredDepartureTime",
                table: "VesselVisitNotifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedLoadingDurationMinutes",
                table: "VesselVisitNotifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedUnloadingDurationMinutes",
                table: "VesselVisitNotifications",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivalTime",
                table: "VesselVisitNotifications");

            migrationBuilder.DropColumn(
                name: "DesiredDepartureTime",
                table: "VesselVisitNotifications");

            migrationBuilder.DropColumn(
                name: "EstimatedLoadingDurationMinutes",
                table: "VesselVisitNotifications");

            migrationBuilder.DropColumn(
                name: "EstimatedUnloadingDurationMinutes",
                table: "VesselVisitNotifications");
        }
    }
}
