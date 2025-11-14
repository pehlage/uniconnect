using System;

namespace UniConnect.Server.Models
{
    public class PostInteraction
    {
        public int Id { get; set; }

        public int PostId { get; set; }
        public string User { get; set; } = "";

        // Tipo: "like", "comment", "reaction"
        public string Type { get; set; } = "";

        // Conteúdo da interação
        public string? Value { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
