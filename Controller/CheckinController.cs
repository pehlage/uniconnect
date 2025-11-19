using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using UniConnect.Server.Data;
using UniConnect.Server.Dtos;
using UniConnect.Server.Models;
using UniConnect.Server.Hubs; // ajuste se usou outro namespace

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
                LastName = dto.LastName,
                Faculty = dto.Faculty,
                Course = dto.Course,
                Semester = dto.Semester,
                Rating = dto.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _db.Checkins.Add(rec);
            await _db.SaveChangesAsync();

            // 1) Emitimos um evento estruturado (objeto) para o painel
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

                // 2) Também emitimos uma mensagem compatível com ReceiveMessage
                //    (mantém seu front atual funcionando sem alterar)
                var user = rec.Name ?? "Visitante";
                var text = $"Check-in: {rec.Type} — {rec.Name} chegou agora!";
                await _hub.Clients.All.SendAsync("ReceiveMessage", user, text);
            }
            catch
            {
                // não interrompe a API se hub falhar, apenas logue se quiser
            }

            return CreatedAtAction(nameof(GetAll), new { id = rec.Id }, rec);
        }
    }
}
