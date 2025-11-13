document.addEventListener("DOMContentLoaded", async () => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notifyHub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  const feedEl = document.getElementById("feed");
  const usersList = document.getElementById("usersList") || document.getElementById("usersListCP");
  const loginModal = document.getElementById("loginModal");
  const loginSubmit = document.getElementById("loginSubmit");
  const loginClose = document.getElementById("loginClose");
  const loginName = document.getElementById("loginName");
  const btnLogin = document.getElementById("btnLogin") || document.getElementById("btnLogin2");

  let currentUser = localStorage.getItem("uniconnect.username");

  // === FEED ===
  function renderPost(user, text) {
    if (!feedEl) return;
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-header">
        <strong>${user}</strong>
        <span class="time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="post-body">${text.replace(/\n/g, "<br>")}</div>
    `;
    feedEl.prepend(card);
  }

  // === SIGNALR ===
  connection.on("ReceiveMessage", (user, text) => renderPost(user, text));

  connection.on("UserConnected", (name) => {
    if (usersList) {
      const li = document.createElement("li");
      li.textContent = name;
      usersList.appendChild(li);
    }
  });

  connection.on("UserDisconnected", (name) => {
    if (usersList) {
      [...usersList.children].forEach(li => {
        if (li.textContent === name) li.remove();
      });
    }
  });

  await connection.start();
  console.log("✅ SignalR conectado.");

  if (currentUser) {
    await connection.invoke("Register", currentUser);
  }

  // === LOGIN ===
  if (btnLogin) {
    btnLogin.addEventListener("click", () => loginModal.classList.remove("hidden"));
  }

  if (loginClose) {
    loginClose.addEventListener("click", () => loginModal.classList.add("hidden"));
  }

  if (loginSubmit) {
    loginSubmit.addEventListener("click", async () => {
      const name = loginName.value.trim();
      if (!name) return alert("Digite seu nome");
      localStorage.setItem("uniconnect.username", name);
      currentUser = name;
      loginModal.classList.add("hidden");
      await connection.invoke("Register", name);
    });
  }

  // ✅ Carregar posts existentes
  if (feedEl) {
    try {
      const resp = await fetch('/api/posts');
      if (resp.ok) {
        const posts = await resp.json();
        posts.forEach(p => renderPost(p.user, p.text));
      }
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
    }
  }
});
