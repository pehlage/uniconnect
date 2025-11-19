// totem.js — autocomplete robusto + fluxo + SIGNALR
document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
        ELEMENTOS DA TELA
  ========================================================== */
  const lockScreen = document.getElementById("lockScreen");
  const totemPage = document.getElementById("totemPage");
  const backBtn = document.getElementById("backBtn");

  const studentCard = document.getElementById("studentCard");
  const visitorCard = document.getElementById("visitorCard");
  const userTypeSelect = document.getElementById("userTypeSelect");

  const checkinBtn = document.getElementById("checkinBtn");

  const formStudent = document.getElementById("formStudent");
  const formStudent2 = document.getElementById("formStudent2");
  const formVisitor = document.getElementById("formVisitor");

  const success = document.getElementById("success");

  let userType = "";
  let studentData = {};
  let selectedRating = null;

  /* ==========================================================
        SIGNALR — envia check-in instantâneo ao painel
  ========================================================== */
  let hub = null;

  async function initSignalR() {
    try {
      hub = new signalR.HubConnectionBuilder()
        .withUrl("/notifyHub")
        .withAutomaticReconnect()
        .build();

      await hub.start();
      console.log("SignalR conectado");
    } catch (err) {
      console.warn("Erro ao conectar ao SignalR:", err);
    }
  }

  initSignalR();

  /* ==========================================================
        LOCKSCREEN
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
  backBtn.onclick = () => location.reload();

  /* ==========================================================
        SELEÇÃO DO TIPO
  ========================================================== */
  studentCard && studentCard.addEventListener("click", () => {
    userType = "student";
    studentCard.classList.add("selected");
    visitorCard.classList.remove("selected");
    checkinBtn.classList.remove("hidden");
  });

  visitorCard && visitorCard.addEventListener("click", () => {
    userType = "visitor";
    visitorCard.classList.add("selected");
    studentCard.classList.remove("selected");
    checkinBtn.classList.remove("hidden");
  });

  /* ==========================================================
        INICIAR CHECK-IN
  ========================================================== */
  checkinBtn && checkinBtn.addEventListener("click", () => {
    checkinBtn.classList.add("hidden");
    userTypeSelect && userTypeSelect.classList.add("hidden");

    if (userType === "student") {
      formStudent.classList.remove("hidden");
      document.getElementById("nameStudent")?.focus();
    }
    if (userType === "visitor") {
      formVisitor.classList.remove("hidden");
      document.getElementById("visitorName")?.focus();
    }
  });

  /* ==========================================================
        ESTUDANTE ETAPA 1
  ========================================================== */
  document.getElementById("nextBtnStudent")?.addEventListener("click", () => {
    const name = document.getElementById("nameStudent").value.trim();
    const faculty = document.getElementById("collegeStudent").value.trim();
    const course = document.getElementById("courseStudent").value.trim();
    const semester = document.getElementById("semesterStudent").value.trim();

    if (!name || !faculty || !course || !semester) {
      alert("Preencha todas as informações!");
      return;
    }

    studentData = { name, faculty, course, semester };

    formStudent.classList.add("hidden");
    formStudent2.classList.remove("hidden");
  });

  /* ==========================================================
        FINALIZAR — ESTUDANTE
  ========================================================== */
  document.getElementById("finalizeStudentBtn")?.addEventListener("click", async () => {

    const payload = {
        type: "student",
        name: studentData.name,
        lastName: "",
        faculty: studentData.faculty,
        course: studentData.course,
        semester: studentData.semester,
        rating: selectedRating
    };

    await sendCheckin(payload);

    formStudent2.classList.add("hidden");
    success.classList.remove("hidden");
    setTimeout(() => location.reload(), 2500);
  });


  /* ==========================================================
        FINALIZAR — VISITANTE
  ========================================================== */
  document.getElementById("finalizeVisitorBtn")?.addEventListener("click", async () => {

    const name = document.getElementById("visitorName")?.value.trim();
    const last = document.getElementById("visitorLastName")?.value.trim();

    if (!name || !last) {
        alert("Preencha nome e sobrenome!");
        return;
    }

    const payload = {
        type: "visitor",
        name,
        lastName: last,
        faculty: "",
        course: "",
        semester: "",
        rating: selectedRating
    };

    await sendCheckin(payload);

    formVisitor.classList.add("hidden");
    success.classList.remove("hidden");
    setTimeout(() => location.reload(), 2500);
  });

  /* ==========================================================
   FUNÇÃO REUTILIZÁVEL — Envio ao banco + SignalR
  ========================================================== */
  async function sendCheckin(payload) {
      try {
          // 1. Salvar no banco
          await fetch("/api/checkins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });

          // 2. Enviar ao painel via SignalR
          if (hub) {
              const msgText =
                  `Check-in: ${payload.type} — ${payload.name} chegou agora! (Projeto Integrador)`;
                
              await hub.invoke("SendMessage", payload.name, msgText);
          }

      } catch (err) {
          console.error("Erro ao enviar check-in:", err);
      }
  }


  /* ==========================================================
        AUTOCOMPLETE + EMOJIS
        (todo o restante do SEU CÓDIGO original permanece igual)
  ========================================================== */

  /* --------------- UTILIDADES, AUTOCOMPLETE E EMOJIS --------------- */
  function debounce(fn, ms = 180) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function attachKeyboardNav(input, list) {
    let index = -1;
    input.addEventListener("keydown", (e) => {
      const items = Array.from(list.querySelectorAll("li"));
      if (!items.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        index = Math.min(index + 1, items.length - 1);
        items.forEach((it, i) => it.classList.toggle("focused", i === index));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        index = Math.max(index - 1, 0);
        items.forEach((it, i) => it.classList.toggle("focused", i === index));
      } else if (e.key === "Enter" && index >= 0) {
        e.preventDefault();
        items[index].click();
      }
    });

    input.addEventListener("input", () => index = -1);
    input.addEventListener("focus", () => index = -1);
  }

  (function setupGlobalClickClose() {
    const handler = (ev) => {
      if (!ev.target.closest(".search-box")) {
        document.querySelectorAll(".autocomplete").forEach(u => u.classList.add("hidden"));
      }
    };
    document.addEventListener("click", handler);
  })();

  const initializedAuto = new Set();
  function setupAutocomplete(inputId, listId, sourceArray) {
    if (initializedAuto.has(inputId)) return;
    initializedAuto.add(inputId);

    const input = document.getElementById(inputId);
    if (!input) return;

    let list = document.getElementById(listId);
    if (!list) {
      list = document.createElement("ul");
      list.id = listId;
      list.className = "autocomplete hidden";
      const parent = input.parentElement?.classList.contains("search-box")
        ? input.parentElement
        : input.parentElement;
      parent.appendChild(list);
    }

    function renderMatches(matches) {
      list.innerHTML = "";
      matches.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => {
          input.value = item;
          list.classList.add("hidden");
        };
        list.appendChild(li);
      });

      list.classList.toggle("hidden", matches.length === 0);
    }

    input.addEventListener("input", debounce(() => {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = "";

      if (!q) {
        list.classList.add("hidden");
        return;
      }

      const starts = [];
      const includes = [];
      for (const s of sourceArray) {
        const low = s.toLowerCase();
        if (low.startsWith(q)) starts.push(s);
        else if (low.includes(q)) includes.push(s);
      }
      const results = starts.concat(includes);
      renderMatches(results);
    }, 160));

    attachKeyboardNav(input, list);
  }

  /* faculdades fixas */
  const colleges = [
    "UNISO – Universidade de Sorocaba",
    "FACENS – Faculdade de Engenharia de Sorocaba",
    "UNIP Sorocaba",
    "Anhanguera Sorocaba",
    "Fatec Sorocaba",
    "UNES Faculdade",
    "UFSCar – Campus Sorocaba",
    "Unicesumar Sorocaba",
    "Cruzeiro do Sul – Sorocaba",
    "Anhanguera Campus Nogueira"
  ];
  setupAutocomplete("collegeStudent", "collegeListStudent", colleges);
  setupAutocomplete("collegeVisitor", "collegeListVisitor", colleges);

  /* cursos */
  const fallbackUnisoCourses = [
    "Análise e Desenvolvimento de Sistemas",
    "Arquitetura e Urbanismo",
    "Administração",
    "Ciência da Computação",
    "Enfermagem",
    "Fisioterapia",
    "Engenharia de Produção",
    "Engenharia Civil",
    "Engenharia Elétrica",
    "Engenharia Mecânica",
    "Estética e Cosmética",
    "Jornalismo",
    "Marketing",
    "Medicina Veterinária",
    "Nutrição",
    "Psicologia",
    "Sistemas de Informação",
    "Tecnologia em Gestão Comercial",
    "Design Gráfico",
    "Direito"
  ];

  let unisoCourses = fallbackUnisoCourses.slice();

  fetch("./js/courses.json")
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data.unisoCourses)) {
        unisoCourses = data.unisoCourses.slice();
      }
    })
    .catch(() => console.warn("courses.json não encontrado, usando fallback"))
    .finally(() => setupAutocomplete("courseStudent", "courseList", unisoCourses));

  /* emojis */
  document.querySelectorAll(".emoji").forEach(emoji => {
    emoji.addEventListener("click", () => {
      selectedRating = emoji.textContent;
      const parent = emoji.parentElement;
      parent.querySelectorAll(".emoji").forEach(e => e.classList.remove("selected"));
      emoji.classList.add("selected");
    });
  });

});
