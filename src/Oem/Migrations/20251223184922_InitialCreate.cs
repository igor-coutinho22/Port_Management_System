using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Oem.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OperationPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleDate = table.Column<DateOnly>(type: "date", nullable: false),
                    HeuristicUsed = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TotalDelayMinutes = table.Column<double>(type: "double precision", nullable: false),
                    AlgorithmRuntimeSeconds = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Author = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationPlanAudit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Author = table.Column<string>(type: "text", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    ChangesDescription = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationPlanAudit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationPlanAudit_OperationPlans_OperationPlanId",
                        column: x => x.OperationPlanId,
                        principalTable: "OperationPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OperationPlanItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    VesselVisitId = table.Column<Guid>(type: "uuid", nullable: false),
                    VesselIMO = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ServiceStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ServiceEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UnloadingStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UnloadingEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LoadingStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LoadingEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NumberOfCranes = table.Column<int>(type: "integer", nullable: false),
                    NumberOfStaff = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationPlanItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationPlanItems_OperationPlans_OperationPlanId",
                        column: x => x.OperationPlanId,
                        principalTable: "OperationPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OperationPlanAudit_OperationPlanId",
                table: "OperationPlanAudit",
                column: "OperationPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationPlanItems_OperationPlanId",
                table: "OperationPlanItems",
                column: "OperationPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OperationPlanAudit");

            migrationBuilder.DropTable(
                name: "OperationPlanItems");

            migrationBuilder.DropTable(
                name: "OperationPlans");
        }
    }
}
