document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================================
  //  CONEXÃO COM SIGNALR
  // ==========================================================
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notifyHub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  const feedEl = document.getElementById("feed");
  const usersList = document.getElementById("usersList");

  // Modal de login
  const loginModal = document.getElementById("loginModal");
  const loginSubmit = document.getElementById("loginSubmit");
  const loginClose = document.getElementById("loginClose");
  const loginName = document.getElementById("loginName");
  const btnLogin = document.getElementById("btnLogin");

  let currentUser = localStorage.getItem("uniconnect.username");


  // ==========================================================
  //  RENDERIZAR POSTS
  // ==========================================================
  function renderPost(user, text) {
    if (!feedEl) return;

    user = user ?? "Anônimo";
    text = text ?? "";

    const isCheckin = text.startsWith("Check-in");

    // Mantém card animado do totem
    if (isCheckin) {
      const card = document.createElement("div");
      card.className = "checkin-card";
      card.innerHTML = `
        <div class="checkin-header">
          <div class="checkin-icon">🎉</div>
          <strong>${user}</strong>
          <span class="checkin-tag">CHECK-IN</span>
          <span class="muted">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="checkin-text">${text.replace(/\n/g, "<br>")}</div>
      `;
      feedEl.prepend(card);
      return;
    }

    // ID do post
    const postId = "post_" + Date.now() + "_" + Math.random().toString(36).substring(2);

    // Estrutura temporária
    window.postData = window.postData || {};
    window.postData[postId] = { likes: 0, comments: [], reactions: [] };

    const card = document.createElement("div");
    card.className = "post-card feed-post";

    card.innerHTML = `
      <div class="post-top">
        <div class="post-avatar">${user.charAt(0).toUpperCase()}</div>
        <div class="post-meta">
          <strong>${user}</strong>
          <span class="muted">${new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div class="post-body">${text.replace(/\n/g, "<br>")}</div>

      <div class="post-actions">
        <button class="action-btn like-btn" data-id="${postId}">
          💛 Curtir (<span id="like-${postId}">0</span>)
        </button>
        <button class="action-btn comment-btn" data-id="${postId}">
          💬 Comentar
        </button>
        <button class="action-btn react-btn" data-id="${postId}">
          😀 Reações
        </button>
      </div>

      <div class="reaction-bar hidden" id="reactions-${postId}">
        <span class="reaction" data-r="😀">😀</span>
        <span class="reaction" data-r="😍">😍</span>
        <span class="reaction" data-r="😡">😡</span>
        <span class="reaction" data-r="😢">😢</span>
        <span class="reaction" data-r="👍">👍</span>
        <span class="reaction" data-r="🎉">🎉</span>
      </div>
    `;

    feedEl.prepend(card);

    // Curtir
    card.querySelector(".like-btn").addEventListener("click", () => {
      window.postData[postId].likes++;
      document.getElementById("like-" + postId).innerText =
        window.postData[postId].likes;
    });

    // Abrir comentários
    card.querySelector(".comment-btn").addEventListener("click", () => {
      openCommentModal(postId);
    });

    // Mostrar reações
    card.querySelector(".react-btn").addEventListener("click", () => {
      document.getElementById("reactions-" + postId).classList.toggle("hidden");
    });

    // Reagir
    [...card.querySelectorAll(".reaction")].forEach(reaction => {
      reaction.addEventListener("click", e => {
        const r = e.target.dataset.r;
        window.postData[postId].reactions.push(r);
        alert(`Você reagiu com ${r}`);
        document.getElementById("reactions-" + postId).classList.add("hidden");
      });
    });
  }


  // ==========================================================
  //  RECEBER POSTS EM TEMPO REAL
  // ==========================================================
  connection.on("ReceiveMessage", (user, text) => {
    renderPost(user, text);
  });

  connection.on("UserConnected", (name) => {
    if (!usersList) return;
    const li = document.createElement("li");
    li.textContent = name;
    usersList.appendChild(li);
  });

  connection.on("UserDisconnected", (name) => {
    [...usersList.children].forEach(li => {
      if (li.textContent === name) li.remove();
    });
  });


  // ==========================================================
  //  INICIAR SIGNALR
  // ==========================================================
  try {
    await connection.start();
    console.log("SignalR conectado.");
  } catch (err) {
    console.error(err);
  }

  if (currentUser) {
    await connection.invoke("Register", currentUser);
  }


  // ==========================================================
  //  LOGIN
  // ==========================================================
  if (btnLogin && loginModal) {
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


  // ==========================================================
  //  CARREGAR POSTS INICIAIS
  // ==========================================================
  if (feedEl) {
    try {
      const resp = await fetch("/api/posts");
      if (resp.ok) {
        const posts = await resp.json();
        posts.forEach(p => {
          const user = p.author ?? p.title ?? "Anônimo";
          const text = p.content ?? p.body ?? "";
          renderPost(user, text);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    }
  }


  // ==========================================================
  //  MODAL DE COMENTÁRIOS (VERSÃO FIXA)
  // ==========================================================
  function openCommentModal(postId) {
    const modal = document.getElementById("commentModal");
    const list = document.getElementById("commentList");
    const input = document.getElementById("newComment");

    modal.classList.add("show");

    // Limpa lista
    list.innerHTML = "";

    // Preenche comentários gravados na memória
    window.postData[postId].comments.forEach(c => {
      list.innerHTML += `<li>• ${c}</li>`;
    });

    input.value = "";

    // Enviar novo comentário
    document.getElementById("sendComment").onclick = () => {
      const txt = input.value.trim();
      if (!txt) return;

      window.postData[postId].comments.push(txt);
      list.innerHTML += `<li>• ${txt}</li>`;
      input.value = "";
    };

    // Fechar modal
    document.getElementById("closeCommentModal").onclick = () => {
      modal.classList.remove("show");
    };

    modal.onclick = e => {
      if (e.target === modal) modal.classList.remove("show");
    };
  }

});
