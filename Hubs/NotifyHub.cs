using Microsoft.AspNetCore.SignalR;

namespace UniConnect.Server.Hubs
{
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

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
