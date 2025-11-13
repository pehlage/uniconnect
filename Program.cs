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

// explicit routes
app.MapGet("/", () => Results.Redirect("/UniConnect.Server/wwwroot/painel.html"));
app.MapGet("/feed", () => Results.Redirect("/UniConnect.Server/wwwroot/painel.html"));
app.MapGet("/create-post", () => Results.Redirect("/UniConnect.Server/wwwroot/create-post.html"));
app.MapGet("/alerts", () => Results.Redirect("/UniConnect.Server/wwwroot/alerts.html"));
app.MapGet("/events", () => Results.Redirect("/UniConnect.Server/wwwroot/events.html"));

// notify endpoint (POST)
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

app.Run();

// message model
public record Message(string User, string Text);

// Hub with presence methods
public class NotifyHub : Hub
{
    // client calls Register(name)
    public async Task Register(string name)
    {
        // inform all clients that a user connected
        await Clients.All.SendAsync("UserConnected", name);
    }

    // client can call Unregister on manual logout (optional)
    public async Task Unregister(string name)
    {
        await Clients.All.SendAsync("UserDisconnected", name);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Optionally, you can broadcast a generic disconnected event (client should send Unregister before leaving if possible)
        await base.OnDisconnectedAsync(exception);
    }
}
