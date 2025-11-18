using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniConnect.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCheckin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventRating",
                table: "Checkins");

            migrationBuilder.DropColumn(
                name: "PresentationRating",
                table: "Checkins");

            migrationBuilder.DropColumn(
                name: "UserType",
                table: "Checkins");

            migrationBuilder.RenameColumn(
                name: "College",
                table: "Checkins",
                newName: "Type");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Checkins",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "Faculty",
                table: "Checkins",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rating",
                table: "Checkins",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Faculty",
                table: "Checkins");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Checkins");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Checkins",
                newName: "College");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Checkins",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventRating",
                table: "Checkins",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PresentationRating",
                table: "Checkins",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserType",
                table: "Checkins",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
