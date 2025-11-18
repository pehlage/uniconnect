// Models/CheckinRecord.cs
using System;

namespace UniConnect.Server.Models
{
    public class CheckinRecord
    {
        public int Id { get; set; }

        // importante: o controller usa "Type"
        // valores esperados: "student" | "visitor" ou qualquer string descritiva
        public string? Type { get; set; } = "visitor";

        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Faculty { get; set; }
        public string? Course { get; set; }
        public string? Semester { get; set; }
        public string? Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
