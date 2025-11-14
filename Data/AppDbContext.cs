using Microsoft.EntityFrameworkCore;
using UniConnect.Server.Models;

namespace UniConnect.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Post> Posts { get; set; }
        public DbSet<PostInteraction> PostInteractions { get; set; }

    }
}
