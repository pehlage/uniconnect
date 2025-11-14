document.addEventListener("DOMContentLoaded", () => {

  const lockScreen = document.getElementById("lockScreen");
  const totemPage = document.getElementById("totemPage");
  const backBtn = document.getElementById("backBtn");

  const keyboard = document.getElementById("keyboard");

  const nameInput = document.getElementById("name");
  const courseInput = document.getElementById("course");

  const ratingEventEl = document.getElementById("ratingEvent");
  const ratingPresentationEl = document.getElementById("ratingPresentation");

  /* ==========================================================
        iPHONE-LIKE SLIDE TO UNLOCK
     ========================================================== */
  let startY = 0;

lockScreen.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
}, { passive: true });

lockScreen.addEventListener("touchmove", e => {
    const currentY = e.touches[0].clientY;
    if (currentY < startY - 80) unlock();
}, { passive: true });

  lockScreen.addEventListener("click", unlock);
  document.addEventListener("keydown", e => {
    if (e.key === "Enter") unlock();
  });

  function unlock() {
    if (lockScreen.classList.contains("hide")) return;

    lockScreen.classList.add("hide");

    setTimeout(() => {
      lockScreen.style.display = "none";
      totemPage.classList.remove("hidden");
      totemPage.classList.add("show");
    }, 600);
  }

  /* ==========================================================
        BOTÃO VOLTAR
     ========================================================== */
  backBtn.addEventListener("click", () => {
    lockScreen.style.display = "flex";
    lockScreen.classList.remove("hide");
    totemPage.classList.remove("show");
    totemPage.classList.add("hidden");

    // fecha teclado se estiver aberto
    closeKeyboard();
  });

  /* ==========================================================
        TECLADO VIRTUAL — ESTILO iPHONE (compacto)
     ========================================================== */

  let activeInput = null;
  let isShift = false;

  // efeito sonoro (pequeno click)
  const keySound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
  keySound.volume = 0.18;

  function playSound() {
    try {
      keySound.currentTime = 0;
      keySound.play();
    } catch (e) {
      // som pode falhar em alguns browsers sem interação do usuário
    }
  }

  // Layout compacto do teclado
  const rows = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["⇧","z","x","c","v","b","n","m","⌫"],
    ["espaço"]
  ];

  function openKeyboard(input) {
    activeInput = input;
    isShift = false; // reset shift ao abrir
    renderKeyboard();
    keyboard.classList.remove("hidden");
    // força scroll do teclado (visual)
    keyboard.scrollIntoView({behavior: "smooth"});
  }

  function closeKeyboard() {
    keyboard.classList.add("hidden");
    activeInput = null;
    isShift = false;
    renderKeyboard();
  }

  function renderKeyboard() {
    keyboard.innerHTML = "";
    keyboard.setAttribute("aria-hidden", keyboard.classList.contains("hidden") ? "true" : "false");

    rows.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("kb-row");

      row.forEach(key => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("kb-key");

        if (key === "espaço") {
          btn.classList.add("space-key");
          btn.textContent = "Espaço";
          btn.setAttribute("aria-label","espaço");
        } else if (key === "⇧") {
          btn.classList.add("shift-key");
          btn.textContent = "⇧";
          btn.setAttribute("aria-pressed", isShift ? "true" : "false");
        } else if (key === "⌫") {
          btn.classList.add("del-key");
          btn.innerHTML = "⌫";
          btn.setAttribute("aria-label","backspace");
        } else {
          btn.textContent = isShift ? key.toUpperCase() : key;
          btn.setAttribute("data-char", key);
        }

        btn.addEventListener("click", (ev) => {
          // impedir blur do input quando clicar no botão
          ev.preventDefault();
          handleKey(key);
        });

        rowDiv.appendChild(btn);
      });

      keyboard.appendChild(rowDiv);
    });
  }

  function handleKey(key) {
    playSound();

    if (!activeInput) return;

    if (key === "⌫") {
      activeInput.value = activeInput.value.slice(0, -1);
      activeInput.focus();
      return;
    }

    if (key === "⇧") {
      isShift = !isShift;
      renderKeyboard();
      activeInput.focus();
      return;
    }

    if (key === "espaço") {
      activeInput.value += " ";
      activeInput.focus();
      return;
    }

    // letras e números
    const char = isShift ? key.toUpperCase() : key;
    activeInput.value += char;
    activeInput.focus();

    // quando shift é momentâneo (comportamento similar ao celular): desligar após inserir letra
    if (isShift && key.length === 1 && /[a-z]/i.test(key)) {
      isShift = false;
      renderKeyboard();
    }
  }

  // Abrir teclado ao focar (não altera lógica existente)
  nameInput.addEventListener("focus", () => openKeyboard(nameInput));
  courseInput.addEventListener("focus", () => openKeyboard(courseInput));

  // Fechar teclado ao clicar fora do input e do teclado
  document.addEventListener("click", (e) => {
    const isInput = e.target === nameInput || e.target === courseInput;
    const isKeyboardBtn = Boolean(e.target.closest("#keyboard"));
    const isBackBtn = Boolean(e.target.closest("#backBtn"));

    if (!isInput && !isKeyboardBtn && !isBackBtn) {
      closeKeyboard();
    }
  });

  // Evita que tocar no teclado faça o layout scrollar para cima (em mobiles)
  keyboard.addEventListener("touchstart", (e) => {
    e.preventDefault();
  }, { passive: false });

  /* ==========================================================
        AUTOCOMPLETE DE CURSOS
     ========================================================== */
  const courses = [
    "Engenharia de Software",
    "Ciência da Computação",
    "Sistemas de Informação",
    "Engenharia Elétrica",
    "Engenharia Mecânica",
    "Engenharia Civil",
    "Administração",
    "Direito",
    "Psicologia",
    "Arquitetura",
    "Medicina",
    "Enfermagem",
    "Educação Física",
    "Análise e Desenvolvimento de Sistemas"
  ];

  const list = document.getElementById("courseList");

  courseInput.addEventListener("input", () => {
    const text = courseInput.value.toLowerCase();
    list.innerHTML = "";

    if (!text) {
      list.classList.add("hidden");
      return;
    }

    const results = courses.filter(c =>
      c.toLowerCase().includes(text)
    );

    results.forEach(course => {
      const li = document.createElement("li");
      li.textContent = course;
      li.onclick = () => {
        courseInput.value = course;
        list.classList.add("hidden");
        courseInput.focus();
      };
      list.appendChild(li);
    });

    list.classList.toggle("hidden", results.length === 0);
  });

  /* ==========================================================
        EMOJIS
     ========================================================== */
  document.querySelectorAll(".emoji").forEach(emoji => {
    emoji.onclick = () => {
      emoji.parentElement
           .querySelectorAll(".emoji")
           .forEach(x => x.classList.remove("selected"));
      emoji.classList.add("selected");
    };
  });

  /* ==========================================================
        FLUXO DO CHECK-IN
     ========================================================== */
  const checkinBtn = document.getElementById("checkinBtn");
  const form1 = document.getElementById("form");
  const form2 = document.getElementById("form2");
  const success = document.getElementById("success");

  checkinBtn.onclick = () => {
    checkinBtn.classList.add("hidden");
    form1.classList.remove("hidden");
    // focus no primeiro campo e abrir teclado
    setTimeout(() => {
      nameInput.focus();
      openKeyboard(nameInput);
    }, 240);
  };

  document.getElementById("nextBtn").onclick = () => {
    if (!nameInput.value.trim() || !courseInput.value.trim()) {
      alert("Preencha seu nome e curso!");
      return;
    }

    form1.classList.add("hidden");
    form2.classList.remove("hidden");
  };

  document.getElementById("finalizeBtn").onclick = async () => {

    const name = nameInput.value.trim();
    const course = courseInput.value.trim();
    const ratingEvent =
      ratingEventEl.querySelector(".selected")?.textContent ?? "🙂";

    const ratingPresentation =
      ratingPresentationEl.querySelector(".selected")?.textContent ?? "🙂";

    const message =
      `Check-in — Curso: ${course} | Evento: ${ratingEvent} | Apresentação: ${ratingPresentation}`;

    // envia para o feed
    try {
      await fetch("/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: name, text: message })
      });
    } catch (err) {
      console.warn("Erro ao notificar (mas continua):", err);
    }

    // salva no banco
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, body: message })
      });
    } catch (err) {
      console.warn("Erro ao salvar no banco (mas continua):", err);
    }

    form2.classList.add("hidden");
    success.classList.remove("hidden");

    setTimeout(() => location.reload(), 2600);
  };

});
