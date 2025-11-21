using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using UniConnect.Server.Data;
using UniConnect.Server.Dtos;
using UniConnect.Server.Models;
using UniConnect.Server.Hubs;

namespace UniConnect.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckinsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<NotifyHub> _hub;

        public CheckinsController(AppDbContext db, IHubContext<NotifyHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Checkins
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }

       [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCheckinDto dto)
        {
            var rec = new CheckinRecord
            {
                Type = dto.Type ?? "visitor",
                Name = dto.Name,
                LastName = dto.LastName ?? "",
                Faculty = dto.Faculty,
                Course = dto.Course,
                Semester = dto.Semester,
                Rating = dto.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _db.Checkins.Add(rec);
            await _db.SaveChangesAsync();

            // 1) Emite evento estruturado (objeto) — feed.js já tem handler para NewCheckin
            try
            {
                await _hub.Clients.All.SendAsync("NewCheckin", new {
                    id = rec.Id,
                    type = rec.Type,
                    name = rec.Name,
                    lastName = rec.LastName,
                    faculty = rec.Faculty,
                    course = rec.Course,
                    semester = rec.Semester,
                    rating = rec.Rating,
                    createdAt = rec.CreatedAt
                });

                // 2) Emite também a mensagem legível (compatibilidade)
                var user = rec.Name ?? "Visitante";
                var text = $"{rec.Name} — {rec.Course ?? "—"} / {rec.Faculty ?? "—"} / sem: {rec.Semester ?? "—"}";
                await _hub.Clients.All.SendAsync("NewCheckin", new {
                    id = rec.Id,
                    type = rec.Type,
                    name = rec.Name,
                    lastName = rec.LastName,
                    faculty = rec.Faculty,
                    course = rec.Course,
                    semester = rec.Semester,
                    rating = rec.Rating,
                    createdAt = rec.CreatedAt
                });
            }
            catch
            {
                // Se o hub falhar, não interrompe a API. Opcional: log.
            }

            return CreatedAtAction(nameof(GetAll), new { id = rec.Id }, rec);
        }

    }
}
