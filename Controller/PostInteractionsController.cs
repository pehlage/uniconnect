using Microsoft.AspNetCore.Mvc;
using UniConnect.Server.Data;
using UniConnect.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace UniConnect.Server.Controllers
{
    [Route("api/interactions")]
    [ApiController]
    public class PostInteractionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PostInteractionsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/interactions/{postId}
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetInteractions(int postId)
        {
            var interactions = await _db.PostInteractions
                .Where(i => i.PostId == postId)
                .OrderBy(i => i.CreatedAt)
                .ToListAsync();

            return Ok(interactions);
        }

        // POST: api/interactions
        [HttpPost]
        public async Task<IActionResult> AddInteraction([FromBody] PostInteraction interaction)
        {
            _db.PostInteractions.Add(interaction);
            await _db.SaveChangesAsync();
            return Ok(interaction);
        }
    }
}
