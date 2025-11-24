document.addEventListener("DOMContentLoaded", () => {
  const feed = document.querySelector(".feed");
  if (!feed) return;

  const alerts = [
    { emoji: "🍔", text: "Não esqueça de passar nas barracas de comida!" },
    { emoji: "🚰", text: "Lembre-se de beber água regularmente." },
    { emoji: "📸", text: "Aproveite os pontos de foto espalhados pelo campus!" },
    { emoji: "🎶", text: "A trilha musical começa às 19h — esteja lá!" },
    { emoji: "🧭", text: "Confira o mapa do evento para aproveitar tudo." },
    { emoji: "🎟️", text: "Tenha sua carteirinha ou ingresso sempre à mão." }
  ];

  feed.innerHTML = "";

  alerts.forEach((a, i) => {
    const item = document.createElement("div");
    item.className = "simple-alert";
    item.style.animationDelay = `${i * 0.08}s`;

    item.innerHTML = `
      <div class="emoji">${a.emoji}</div>
      <div class="text">${a.text}</div>
      <div class="close">✖</div>
    `;

    // Fechamento suave profissional
    item.querySelector(".close").onclick = () => {
      item.classList.add("closing");
      setTimeout(() => item.remove(), 300);
    };

    feed.appendChild(item);
  });
});
