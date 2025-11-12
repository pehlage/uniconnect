
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

app.UseCors();
app.UseDefaultFiles();  // 🔹 Permite servir index.html automaticamente
app.UseStaticFiles();   // 🔹 Permite servir arquivos .html, .js, etc

app.MapHub<NotifyHub>("/notifyHub");
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

app.Run();

public record Message(string User, string Text);
public class NotifyHub : Hub { }