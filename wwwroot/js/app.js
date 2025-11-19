// feed.js — versão corrigida COMPLETA
document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================================
  //  SIGNALR
  // ==========================================================
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notifyHub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  const feedEl = document.getElementById("feed");
  let feedData = [];       // dados carregados do banco (persistidos)
  let liveFeed = [];       // dados recebidos ao vivo via SignalR
  const seenSignatures = new Set(); // evita duplicação (user|text)

  // ==========================================================
  //  RENDERIZAÇÃO (Posts + Check-ins)
  // ==========================================================
  function renderPost(user, text, createdAt = null, rec = null) {
    if (!feedEl) return;

    user = user ?? "Anônimo";
    text = text ?? "";
    const timestamp = createdAt ? new Date(createdAt) : new Date();

    const isCheckin =
      text.startsWith("Check-in") ||
      text.includes("chegou agora!") ||
      text.includes("Projeto Integrador");

    // CHECK-IN (VISITANTE OU ESTUDANTE)
    if (isCheckin) {
      const isVisitor = rec && rec.type === "visitor";

      const card = document.createElement("div");
      card.className = "checkin-card";

      card.innerHTML = `
        <div class="checkin-header">
            <div class="checkin-avatar">${(user.charAt && user.charAt(0) || "A").toUpperCase()}</div>
            <div class="checkin-user-info">
                <strong>${escapeHtml(user)}</strong>
                <small>${timestamp.toLocaleTimeString("pt-BR")}</small>
            </div>
        </div>

        <div class="checkin-body">
            ${escapeHtml(text).replace(/\n/g, "<br>")}
        </div>

        ${ isVisitor
          ?
          `
          <div class="checkin-meta visitor-meta">
              <span class="visitor-badge">👋 Visitante especial</span>
              <p class="visitor-msg">
                  Bem-vindo(a) ao nosso campus! Explore, pergunte e aproveite! 😄
              </p>
          </div>
          `
          :
          `
          <div class="checkin-meta">
              <div><span class="label">Faculdade:</span> ${escapeHtml(rec?.faculty ?? "—")}</div>
              <div><span class="label">Curso:</span> ${escapeHtml(rec?.course ?? "—")}</div>
              <div><span class="label">Semestre:</span> ${escapeHtml(rec?.semester ?? "—")}</div>
          </div>
          `
        }

        <div class="checkin-footer">
            <span class="tag-pill tag-green">✔ Check-in registrado</span>
            <span class="tag-pill">📘 Projeto Integrador</span>
            ${rec?.rating ? `<span class="tag-pill tag-rating">${escapeHtml(rec.rating)}</span>` : ""}
        </div>
      `;

      feedEl.appendChild(card);
      return;
    }

    // POST NORMAL
    const postId = "post_" + Date.now() + "_" + Math.random().toString(36).substring(2);
    window.postData = window.postData || {};
    window.postData[postId] = { likes: 0, comments: [], reactions: [] };

    const card = document.createElement("div");
    card.className = "post-card feed-post";

    card.innerHTML = `
      <div class="post-top">
        <div class="post-avatar">${(user.charAt && user.charAt(0) || "A").toUpperCase()}</div>
        <div class="post-meta">
          <strong>${escapeHtml(user)}</strong>
          <span class="muted">${timestamp.toLocaleTimeString("pt-BR")}</span>
        </div>
      </div>

      <div class="post-body">${escapeHtml(text).replace(/\n/g, "<br>")}</div>

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

    feedEl.appendChild(card);

    // eventos
    card.querySelector(".like-btn").addEventListener("click", () => {
      window.postData[postId].likes++;
      document.getElementById("like-" + postId).innerText =
        window.postData[postId].likes;
    });

    card.querySelector(".comment-btn").addEventListener("click", () => {
      openCommentModal(postId);
    });

    card.querySelector(".react-btn").addEventListener("click", () => {
      document.getElementById("reactions-" + postId).classList.toggle("hidden");
    });

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
  //  ADICIONA AO FEED (evita duplicação e re-render ordenado)
  // ==========================================================
  function makeSignature(item) {
    const u = (item.user ?? "").toString().trim();
    const t = (item.text ?? "").toString().trim();
    return `${u}|${t}`;
  }

  function addToFeed(item) {
    // normaliza createdAt
    if (!item.createdAt) item.createdAt = new Date().toISOString();

    // dedupe simples por assinatura (user + text)
    const sig = makeSignature(item);
    if (seenSignatures.has(sig)) {
      // já existe — ignora
      return;
    }
    seenSignatures.add(sig);

    // adiciona ao liveFeed (mensagens ao vivo) para futura ordenação
    liveFeed.push(item);

    // junta tudo e re-render em ordem (mais novo primeiro)
    const all = [...feedData, ...liveFeed];
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // renderiza
    feedEl.innerHTML = "";
    all.forEach(i => renderPost(i.user, i.text, i.createdAt, i.rec));
  }

  // ==========================================================
  //  SIGNALR: receber ao vivo
  //  - aceita ReceiveMessage(user, text)
  //  - ou ReceiveMessage(jsonString)
  // ==========================================================
  connection.on("ReceiveMessage", (...args) => {
    try {
      // caso server envie (user, text)
      if (args.length >= 2) {
        const user = args[0];
        const text = args[1];
        const item = {
          type: text && text.startsWith("Check-in") ? "checkin" : "post",
          user,
          text,
          createdAt: new Date().toISOString(),
          rec: null
        };
        addToFeed(item);
        return;
      }

      // caso envie JSON string
      const raw = args[0];
      if (!raw) return;
      let parsed = raw;
      if (typeof raw === "string") {
        try { parsed = JSON.parse(raw); } catch { /* não JSON */ }
      }

      // parsed agora é objeto
      if (parsed && parsed.text) {
        const item = {
          type: parsed.type ?? (parsed.text.startsWith("Check-in") ? "checkin" : "post"),
          user: parsed.user ?? parsed.name ?? "Anônimo",
          text: parsed.text,
          createdAt: parsed.createdAt ?? new Date().toISOString(),
          rec: parsed.rec ?? null
        };
        addToFeed(item);
      }
    } catch (err) {
      console.error("Erro ao interpretar mensagem do SignalR:", err, args);
    }
  });

  // start connection
  try {
    await connection.start();
    console.log("SignalR conectado.");
  } catch (err) {
    console.error("Falha ao conectar SignalR:", err);
  }

  // ==========================================================
  //  CARREGAR CHECK-INS DO BANCO
  // ==========================================================
  try {
    const response = await fetch("/api/checkins");
    if (response.ok) {
      const checkins = await response.json();
      checkins.forEach(rec => {
        const item = {
          type: "checkin",
          user: rec.name ?? "Visitante",
          text: `Check-in: ${rec.type} — ${rec.name} chegou agora! (Projeto Integrador)`,
          createdAt: rec.createdAt,
          rec: rec
        };
        // adiciona a feedData (persistidos) e marca assinatura para evitar dupes
        feedData.push(item);
        seenSignatures.add(makeSignature(item));
      });
    }
  } catch (err) {
    console.error("Erro ao carregar check-ins:", err);
  }

  // ==========================================================
  //  CARREGAR POSTS DO BANCO
  // ==========================================================
  try {
    const resp = await fetch("/api/posts");
    if (resp.ok) {
      const posts = await resp.json();
      posts.forEach(p => {
        const item = {
          type: "post",
          user: p.author ?? p.title ?? "Anônimo",
          text: p.content ?? p.body ?? "",
          createdAt: p.createdAt,
          rec: null
        };
        feedData.push(item);
        seenSignatures.add(makeSignature(item));
      });
    }
  } catch (err) {
    console.error("Erro ao carregar posts:", err);
  }

  // ==========================================================
  //  ORDENA E RENDERIZA FEED INICIAL (apenas uma vez)
  // ==========================================================
  feedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // renderiza os itens persistidos
  feedData.forEach(item => {
    // append direto aqui (evita dupla adição em liveFeed)
    renderPost(item.user, item.text, item.createdAt, item.rec);
  });

  // ==========================================================
  //  MODAL DE COMENTÁRIOS (mantive igual)
  // ==========================================================
  function openCommentModal(postId) {
    const modal = document.getElementById("commentModal");
    const list = document.getElementById("commentList");
    const input = document.getElementById("newComment");

    if (!modal) return;
    modal.classList.add("show");

    list.innerHTML = "";
    const comments = (window.postData && window.postData[postId] && window.postData[postId].comments) || [];
    comments.forEach(c => { list.innerHTML += `<li>• ${escapeHtml(c)}</li>`; });

    input.value = "";

    document.getElementById("sendComment").onclick = () => {
      const txt = input.value.trim();
      if (!txt) return;
      window.postData[postId].comments.push(txt);
      list.innerHTML += `<li>• ${escapeHtml(txt)}</li>`;
      input.value = "";
    };

    document.getElementById("closeCommentModal").onclick = () => {
      modal.classList.remove("show");
    };

    modal.onclick = e => {
      if (e.target === modal) modal.classList.remove("show");
    };
  }

  // ==========================================================
  //  Helpers
  // ==========================================================
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

});
