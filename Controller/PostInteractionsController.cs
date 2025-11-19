using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniConnect.Server.Data;
using UniConnect.Server.Dtos;
using UniConnect.Server.Models;

namespace UniConnect.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostInteractionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PostInteractionsController(AppDbContext db) => _db = db;

        [HttpGet("post/{postId:int}")]
        public async Task<IActionResult> GetByPost(int postId)
        {
            var list = await _db.PostInteractions
                .Where(pi => pi.PostId == postId)
                .OrderByDescending(pi => pi.CreatedAt)
                .ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostInteractionDto dto)
        {
            // optional: verify if post exists
            var exists = await _db.Posts.AnyAsync(p => p.Id == dto.PostId);
            if (!exists) return BadRequest("Post does not exist.");

            var pi = new PostInteraction
            {
                PostId = dto.PostId,
                User = dto.User ?? "",
                Type = dto.Type ?? "",
                Value = dto.Value
            };

            _db.PostInteractions.Add(pi);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByPost), new { postId = pi.PostId }, pi);
        }
    }
}
