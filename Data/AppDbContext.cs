using Microsoft.EntityFrameworkCore;
using UniConnect.Server.Models;

namespace UniConnect.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Post> Posts { get; set; }
        public DbSet<PostInteraction> PostInteractions { get; set; }
        public DbSet<CheckinRecord> Checkins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ajuste opcional: setar nome da tabela explicitamente
            modelBuilder.Entity<Post>().ToTable("Posts");
            modelBuilder.Entity<PostInteraction>().ToTable("PostInteractions");
            modelBuilder.Entity<CheckinRecord>().ToTable("Checkins");
        }
    }
}
