using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Adiciona serviços necessários
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

// 🔹 Porta dinâmica para Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

// 🔹 Configura middleware
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// 🔹 Hub do SignalR
app.MapHub<NotifyHub>("/notifyHub");

// 🔹 Rota explícita para checkin.html
app.MapGet("/checkin", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("wwwroot/checkin.html");
});

// 🔹 Rota explícita para painel.html
app.MapGet("/painel", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("wwwroot/painel.html");
});

// 🔹 Endpoint para envio de mensagens (API)
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

app.Run();

// 🔹 Modelos
public record Message(string User, string Text);
public class NotifyHub : Hub { }
