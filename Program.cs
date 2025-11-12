using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Adiciona SignalR e CORS
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

// Configura CORS e arquivos estáticos
app.UseCors();
app.UseDefaultFiles();  // Serve automaticamente index.html
app.UseStaticFiles();   // Serve arquivos estáticos (HTML, JS, CSS, etc)

// Mapeia os endpoints
app.MapHub<NotifyHub>("/notifyHub");
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

// 🔹 Configura porta dinâmica (Render usa $PORT)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

// Inicia o servidor
app.Run();

// Classes auxiliares
public record Message(string User, string Text);
public class NotifyHub : Hub { }
