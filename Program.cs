using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

// Porta dinâmica (Render)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// SignalR hub
app.MapHub<NotifyHub>("/notifyHub");

// Rotas explícitas (Render-friendly)
app.MapGet("/", () => Results.Redirect("/painel.html"));
app.MapGet("/feed", () => Results.Redirect("/painel.html"));
app.MapGet("/create-post", () => Results.Redirect("/create-post.html"));
app.MapGet("/alerts", () => Results.Redirect("/alerts.html"));
app.MapGet("/events", () => Results.Redirect("/events.html"));

// Endpoint POST /notify
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

app.Run();

// Models
public record Message(string User, string Text);

// Hub
public class NotifyHub : Hub
{
    public async Task Register(string name)
    {
        await Clients.All.SendAsync("UserConnected", name);
    }

    public async Task Unregister(string name)
    {
        await Clients.All.SendAsync("UserDisconnected", name);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
