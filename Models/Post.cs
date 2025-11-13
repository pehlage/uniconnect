namespace UniConnect.Server.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? Course { get; set; }
        public string? Emoji { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
