using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using UniConnect.Server.Data;
using UniConnect.Server.Models;
using UniConnect.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Configurar host timeout ANTES do Build
builder.WebHost.UseShutdownTimeout(TimeSpan.FromSeconds(10));

// Carrega a connection string
var conn = builder.Configuration.GetConnectionString("DefaultConnection");

// Configura EF + SQL Server Express remoto
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(conn,
        sql => sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null));
});

// CORS liberado (frontend local e clientes remotos)
builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddSignalR();
builder.Services.AddControllers();

var app = builder.Build();

// Define porta dinâmica (Render, Railway, VPS etc.)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

app.UseCors();

// Static files
if (app.Environment.IsDevelopment())
{
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "-1";
        }
    });
}
else
{
    app.UseStaticFiles();
}

// Redireciona página padrão → painel.html
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/" || context.Request.Path == "/index.html")
    {
        context.Response.Redirect("/painel.html");
        return;
    }
    await next();
});

app.MapControllers();
app.MapHub<NotifyHub>("/notifyHub");

// Rotas fixas
app.MapGet("/feed", () => Results.Redirect("/painel.html"));
app.MapGet("/create-post", () => Results.Redirect("/create-post.html"));
app.MapGet("/alerts", () => Results.Redirect("/alerts.html"));
app.MapGet("/events", () => Results.Redirect("/events.html"));

// Endpoint SignalR universal
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});

// Aplicar migrações automaticamente
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        Console.WriteLine("📦 Verificando banco remoto...");

        var pending = db.Database.GetPendingMigrations();

        if (pending.Any())
        {
            Console.WriteLine("🚀 Aplicando migrações...");
            db.Database.Migrate();
            Console.WriteLine("✅ Migrações aplicadas!");
        }
        else
        {
            Console.WriteLine("✔ Nenhuma migração pendente.");
        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("❌ Erro ao conectar ou migrar banco:");
        Console.WriteLine(ex.Message);
        Console.ResetColor();
    }
}

app.Run();

// Records + Hub
public record Message(string User, string Text);