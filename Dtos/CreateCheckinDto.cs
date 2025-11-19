namespace UniConnect.Server.Dtos
{
    public class CreateCheckinDto
    {
        public string? Type { get; set; } = "visitor";
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Faculty { get; set; }
        public string? Course { get; set; }
        public string? Semester { get; set; }
        public string? Rating { get; set; }
    }
}
