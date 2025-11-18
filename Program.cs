using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using UniConnect.Server.Data;
using UniConnect.Server.Models;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Banco SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS + SignalR + Controllers
builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin());
});
builder.Services.AddSignalR();
builder.Services.AddControllers();

var app = builder.Build();

// Porta dinâmica (Render)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

app.UseCors();


// ---------------------------------------------------
// ✅ DURANTE O DESENVOLVIMENTO: arquivos sempre do /wwwroot real + sem cache
// ---------------------------------------------------
if (app.Environment.IsDevelopment())
{
    Console.WriteLine("🔧 Development mode: Static files reloading enabled!");

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
        ),
        ServeUnknownFileTypes = true,
        OnPrepareResponse = ctx =>
        {
            // Força navegador a sempre pegar o arquivo mais novo
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "-1";
        }
    });
}
else
{
    // Produção normal
    app.UseStaticFiles();
}


// ---------------------------------------------------
// 🔁 Redirecionamento padrão: painel.html como homepage
// ---------------------------------------------------
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

// Rotas explícitas
app.MapGet("/feed", () => Results.Redirect("/painel.html"));
app.MapGet("/create-post", () => Results.Redirect("/create-post.html"));
app.MapGet("/alerts", () => Results.Redirect("/alerts.html"));
app.MapGet("/events", () => Results.Redirect("/events.html"));

// Endpoint SignalR
app.MapPost("/notify", async (IHubContext<NotifyHub> hub, Message msg) =>
{
    await hub.Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Text);
    return Results.Ok();
});


// ---------------------------------------------------
// 🔧 Banco de dados: cria + executa migrações se necessário
// ---------------------------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("📦 Verificando banco de dados...");
        db.Database.EnsureCreated();
        var pending = db.Database.GetPendingMigrations();

        if (pending.Any())
        {
            Console.WriteLine("🚀 Aplicando migrações pendentes...");
            db.Database.Migrate();
            Console.WriteLine("✅ Migrações aplicadas com sucesso!");
        }
        else
        {
            Console.WriteLine("✅ Nenhuma migração pendente.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Falha ao aplicar migrações: {ex.Message}");
    }
}

builder.WebHost.UseShutdownTimeout(TimeSpan.FromSeconds(10));
app.Run();

public record Message(string User, string Text);

public class NotifyHub : Hub
{
    public async Task Register(string name) =>
        await Clients.All.SendAsync("UserConnected", name);

    public async Task Unregister(string name) =>
        await Clients.All.SendAsync("UserDisconnected", name);
}
