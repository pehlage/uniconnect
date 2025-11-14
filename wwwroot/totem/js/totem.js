document.addEventListener("DOMContentLoaded", () => {

  const lockScreen = document.getElementById("lockScreen");
  const totemPage = document.getElementById("totemPage");
  const backBtn = document.getElementById("backBtn");

  let startY = 0;
  let sliding = false;

  // ============================
  //   SLIDE PARA CIMA (CELULAR)
  // ============================
  lockScreen.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
    sliding = true;
  });

  lockScreen.addEventListener("touchmove", e => {
    if (!sliding) return;

    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;

    if (diff > 80) {
      sliding = false;
      unlock();
    }
  });

  lockScreen.addEventListener("touchend", () => (sliding = false));

  // ============================
  //   DESBLOQUEAR (FUNÇÃO)
  // ============================
  function unlock() {
    if (lockScreen.classList.contains("hide")) return;

    lockScreen.classList.add("hide");

    setTimeout(() => {
      lockScreen.style.display = "none";
      totemPage.classList.remove("hidden");
      totemPage.classList.add("show");
    }, 400);
  }

  // ============================
  //   DESBLOQUEAR COM ENTER
  // ============================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlock();
  });

  // ============================
  //   DESBLOQUEAR COM CLIQUE
  //   (Tela de descanso apenas)
  // ============================
  lockScreen.addEventListener("click", () => {
    unlock();
  });


  // ============================
  //   BOTÃO VOLTAR
  // ============================
  backBtn.addEventListener("click", () => {

    // esconder formulário e resetar telas internas
    document.getElementById("form").classList.add("hidden");
    document.getElementById("form2").classList.add("hidden");
    document.getElementById("success").classList.add("hidden");
    document.getElementById("checkinBtn").classList.remove("hidden");

    // mostrar lockscreen novamente
    totemPage.classList.remove("show");
    totemPage.classList.add("hidden");

    lockScreen.style.display = "flex";
    lockScreen.classList.remove("hide");
  });


  // ============================
  //   LÓGICA DO CHECK-IN (ORIGINAL)
  // ============================

  const checkinBtn = document.getElementById("checkinBtn");
  const form1 = document.getElementById("form");
  const form2 = document.getElementById("form2");
  const success = document.getElementById("success");

  const nameInput = document.getElementById("name");
  const courseInput = document.getElementById("course");

  const ratingEventEl = document.getElementById("ratingEvent");
  const ratingPresentationEl = document.getElementById("ratingPresentation");

  // emojis seleção
  document.querySelectorAll(".emoji").forEach(emoji => {
    emoji.addEventListener("click", () => {
      emoji.parentElement.querySelectorAll(".emoji").forEach(e => e.classList.remove("selected"));
      emoji.classList.add("selected");
    });
  });

  // abrir formulário
  checkinBtn.addEventListener("click", () => {
    checkinBtn.classList.add("hidden");
    form1.classList.remove("hidden");
  });

  // próxima etapa
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!nameInput.value.trim() || !courseInput.value.trim()) {
      alert("Preencha seu nome e curso.");
      return;
    }
    form1.classList.add("hidden");
    form2.classList.remove("hidden");
  });

  // finalizar check-in
  document.getElementById("finalizeBtn").addEventListener("click", async () => {

    const name = nameInput.value.trim();
    const course = courseInput.value.trim();
    const ratingEvent =
      ratingEventEl.querySelector(".selected")?.textContent ?? "🙂";
    const ratingPresentation =
      ratingPresentationEl.querySelector(".selected")?.textContent ?? "🙂";

    const messageText =
      `Check-in — Curso: ${course} | Evento: ${ratingEvent} | Apresentação: ${ratingPresentation}`;

    // enviar ao feed em tempo real
    await fetch("/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: name, text: messageText })
    });

    // salvar no banco
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name, body: messageText })
    });

    form2.classList.add("hidden");
    success.classList.remove("hidden");

    setTimeout(() => location.reload(), 3500);
  });

});
