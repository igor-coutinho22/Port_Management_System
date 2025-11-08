using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class FixVesselTypeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vessels_VesselTypes_VesselTypeName1",
                table: "Vessels");

            migrationBuilder.DropIndex(
                name: "IX_Vessels_VesselTypeName1",
                table: "Vessels");

            migrationBuilder.DropColumn(
                name: "VesselTypeName1",
                table: "Vessels");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VesselTypeName1",
                table: "Vessels",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Vessels_VesselTypeName1",
                table: "Vessels",
                column: "VesselTypeName1");

            migrationBuilder.AddForeignKey(
                name: "FK_Vessels_VesselTypes_VesselTypeName1",
                table: "Vessels",
                column: "VesselTypeName1",
                principalTable: "VesselTypes",
                principalColumn: "Name",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
