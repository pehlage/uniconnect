using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// SignalR + CORS
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();  // Serve index.html automaticamente
app.UseStaticFiles();   // Serve HTML/CSS/JS

app.MapHub<NotifyHub>("/notifyHub");

// Endpoint opcional para testes via POST
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

// Porta dinâmica exigida pelo Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

app.Run();

public record Message(string User, string Text);
public class NotifyHub : Hub { }
