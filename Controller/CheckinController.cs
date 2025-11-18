using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using UniConnect.Server.Data;
using UniConnect.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace UniConnect.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckinController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotifyHub> _hub;

        public CheckinController(AppDbContext context, IHubContext<NotifyHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        [HttpPost]
        public async Task<IActionResult> RegisterCheckin([FromBody] CheckinRecord record)
        {
            if (string.IsNullOrWhiteSpace(record.Name))
                return BadRequest("Nome é obrigatório.");

            record.CreatedAt = DateTime.UtcNow;

            _context.Checkins.Add(record);
            await _context.SaveChangesAsync();

            // 🔥 envia o check-in para o feed (painel)
            await _hub.Clients.All.SendAsync(
                "ReceiveMessage",
                record.Name,
                $"Check-in: {record.Name} ({record.Type})\nCurso: {record.Course}\nFaculdade: {record.Faculty}"
            );

            return Ok(record);
        }

        [HttpGet]
        public async Task<IActionResult> GetCheckins()
        {
            var all = await _context.Checkins
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(all);
        }
    }
}
