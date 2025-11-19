namespace UniConnect.Server.Models
{
    public class PostInteraction
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string User { get; set; } = "";
        public string Type { get; set; } = "";
        public string? Value { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
