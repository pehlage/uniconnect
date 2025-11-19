namespace UniConnect.Server.Dtos
{
    public class CreatePostInteractionDto
    {
        public int PostId { get; set; }
        public string? User { get; set; }
        public string? Type { get; set; }
        public string? Value { get; set; }
    }
}
