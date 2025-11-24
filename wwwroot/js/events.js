/* ===========================================================
   events-group.js
   Grupo: Projeto Integrador + Modais Premium + Banner + Animações
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const feed = document.querySelector(".feed");
  if (!feed) return;

  // -- PATHS (arquivos locais enviados)
  const DEFAULT_BANNER = "./assets/banner-projeto.webp";
  const THUMBNAIL = "./assets/campus-festival.jpg";
  const THUMBNAIL1 = "./assets/concurso-fotografia.jpg";       
  const THUMBNAIL2 = "./assets/futuro-tecnologia.jpg";       

  const MAP_IMG = "./assets/mapa-uniso.webp";

  /* ================================
     BANNER DO PROJETO
  ================================ */
  const banner = document.createElement("div");
  banner.className = "pi-banner";
  banner.innerHTML = `
    <img src="${DEFAULT_BANNER}" alt="Banner do Projeto" onerror="this.onerror=null;this.src='${THUMBNAIL}'">
    <div class="pi-banner-text">Projeto Integrador</div>
  `;
  feed.prepend(banner);

  /* ================================
     MOCK: PROJETO + EVENTOS
  ================================ */
  const project = {
    title: "Projeto Integrador — Linha de Eventos",
    subtitle: "Lista de Eventos do Projeto Integrador",
    items: [
      {
        id: "ev1",
        img: THUMBNAIL,
        title: "Festival Musical no Campus",
        date: "Dia 14, às 20h",
        details: "Um festival com bandas locais, food trucks e atividades culturais. Ambiente seguro, divertido e aberto a toda comunidade acadêmica."
      },
      {
        id: "ev2",
        img: THUMBNAIL1,
        title: "Concurso de Fotografia",
        date: "Dia 20, às 09h",
        details: "Concurso com o tema 'Vida no Campus'. Traga sua câmera ou celular. Premiação para os 3 melhores registros."
      },
      {
        id: "ev3",
        img: THUMBNAIL2,
        title: "Palestra: O Futuro da Tecnologia",
        date: "Dia 12, às 19h",
        details: "Uma palestra sobre IA, carreiras e tendências tecnológicas. Local: Auditório Central."
      }
    ],
    projectOptions: [
      { key: "sobre", label: "Sobre o Projeto" },
      { key: "mapa", label: "Ver Mapa do Evento" },        // NOVO ITEM (SEGUNDO)
      { key: "regras", label: "Regras e Conduta" },
      { key: "contato", label: "Contato da Coordenação" }
    ]
  };

  /* ================================
     RENDER DO GRUPO
  ================================ */
  const group = document.createElement("div");
  group.className = "pi-group";

  group.innerHTML = `
    <div class="pi-header">
      <button class="pi-toggle" aria-expanded="true" title="Mostrar/Ocultar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#0b2540" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="pi-title-wrap">
        <div class="pi-title">${project.title}</div>
        <div class="pi-sub">${project.subtitle}</div>
      </div>

      <div class="pi-actions">
        <button class="pi-more" title="Opções do projeto">⋮</button>
      </div>
    </div>

    <div class="pi-divider"></div>
    <div class="pi-list" role="list"></div>
  `;

  feed.appendChild(group);

  const list = group.querySelector(".pi-list");
  const toggleBtn = group.querySelector(".pi-toggle");
  const moreBtn = group.querySelector(".pi-more");
  let collapsed = false;

  /* ================================
     RENDER EVENTOS (FILHOS)
  ================================ */
  project.items.forEach((ev, idx) => {
    const it = document.createElement("div");
    it.className = "pi-event";
    it.style.animationDelay = `${idx * 0.06}s`;

    it.innerHTML = `
      <div class="pi-thumb"><img src="${ev.img}" alt="${ev.title}"></div>
      <div class="pi-info">
        <div class="pi-ev-title">${ev.title}</div>
        <div class="pi-ev-sub">${ev.date}</div>
      </div>
    `;

    it.addEventListener("click", () => openEventModal(ev));
    list.appendChild(it);
  });

  /* ================================
     TOGGLE DA SETA
  ================================ */
  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("animate");
    setTimeout(() => toggleBtn.classList.remove("animate"), 420);

    collapsed = !collapsed;

    if (collapsed) {
      group.classList.add("pi-collapsed");
      toggleBtn.setAttribute("aria-expanded", "false");
    } else {
      group.classList.remove("pi-collapsed");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
  });

  /* ================================
     MODAL DO EVENTO (FILHO)
     – NÃO TEM MAIS “Ver mapa”
  ================================ */
  function openEventModal(ev) {
    const overlay = document.createElement("div");
    overlay.className = "pi-overlay";

    const modal = document.createElement("div");
    modal.className = "pi-modal";

    modal.innerHTML = `
      <img class="pi-modal-hero" src="${ev.img}">
      <div class="pi-modal-body">
        <div class="pi-modal-title">${ev.title}</div>
        <div class="pi-modal-date">${ev.date}</div>
        <div class="pi-modal-desc">${ev.details}</div>

        <div class="pi-modal-actions">
          <button class="pi-btn secondary" id="pi-share">Compartilhar</button>
          <button class="pi-btn" id="pi-join">Participar</button>
        </div>

        <div class="pi-modal-close">
          <button id="pi-close">Fechar</button>
        </div>
      </div>
    `;

    document.body.append(overlay, modal);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      overlay.classList.add("active");
      modal.classList.add("active");
    });

    function close() {
      overlay.classList.remove("active");
      modal.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        modal.remove();
        document.body.style.overflow = prevOverflow;
      }, 300);
    }

    overlay.addEventListener("click", close);
    modal.querySelector("#pi-close").addEventListener("click", close);

    modal.querySelector("#pi-join").addEventListener("click", () => {
      const btn = modal.querySelector("#pi-join");
      btn.textContent = "Inscrito ✓";
      btn.disabled = true;
    });

    modal.querySelector("#pi-share").addEventListener("click", async () => {
      await navigator.clipboard.writeText(location.href + "#event-" + ev.id);
      modal.querySelector("#pi-share").textContent = "Copiado ✔";
      setTimeout(() => modal.querySelector("#pi-share").textContent = "Compartilhar", 1500);
    });
  }

  /* ================================
     MODAL DO PROJETO (TRÊS PONTINHOS)
     – Agora inclui “Ver mapa do evento”
  ================================ */
  moreBtn.addEventListener("click", () => openProjectModal(project));

  function openProjectModal(projectData) {
    const overlay = document.createElement("div");
    overlay.className = "pi-overlay";

    const modal = document.createElement("div");
    modal.className = "pi-modal pi-project-modal";

    modal.innerHTML = `
      <div class="pi-modal-body">
        <div class="pi-modal-title">Opções — ${projectData.title}</div>
        <div class="pi-modal-desc">${projectData.subtitle}</div>

        <div class="pi-project-list">
          ${projectData.projectOptions
            .map(o => `<div class="pi-project-item" data-key="${o.key}">${o.label}</div>`)
            .join("")}
        </div>

        <div class="pi-modal-close">
          <button id="proj-close">Fechar</button>
        </div>
      </div>
    `;

    document.body.append(overlay, modal);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      overlay.classList.add("active");
      modal.classList.add("active");
    });

    function close() {
      overlay.classList.remove("active");
      modal.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        modal.remove();
        document.body.style.overflow = prevOverflow;
      }, 250);
    }

    overlay.addEventListener("click", close);
    modal.querySelector("#proj-close").addEventListener("click", close);

    modal.querySelectorAll(".pi-project-item").forEach(el => {
      el.addEventListener("click", () => {
        const key = el.dataset.key;

        close();
        if (key === "mapa") {
          setTimeout(() => openMapModal(), 250);
        } else {
          setTimeout(() => openInfoModal(key), 250);
        }
      });
    });
  }

  /* ================================
     MODAIS DE INFORMAÇÃO
  ================================ */
  function openInfoModal(key) {
    const map = {
      sobre: {
        title: "Sobre o Projeto Integrador",
        text: "Projeto Integrador: integração de disciplinas com entregas, participação e apresentação final."
      },
      regras: {
        title: "Regras e Conduta",
        text: "Seguir normas do campus, respeitar todos e evitar consumo de bebidas em locais proibidos."
      },
      contato: {
        title: "Contato da Coordenação",
        text: "coord.project@uniconnect.edu.br — Atendimento das 9h às 17h."
      }
    };

    const info = map[key] || { title: "Informações", text: "Conteúdo não encontrado." };

    const overlay = document.createElement("div");
    overlay.className = "pi-overlay";

    const modal = document.createElement("div");
    modal.className = "pi-modal";

    modal.innerHTML = `
      <div class="pi-modal-body">
        <div class="pi-modal-title">${info.title}</div>
        <div class="pi-modal-desc">${info.text}</div>
        <div class="pi-modal-close">
          <button id="info-close">Fechar</button>
        </div>
      </div>
    `;

    document.body.append(overlay, modal);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      overlay.classList.add("active");
      modal.classList.add("active");
    });

    function close() {
      overlay.classList.remove("active");
      modal.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        modal.remove();
        document.body.style.overflow = prevOverflow;
      }, 250);
    }

    overlay.addEventListener("click", close);
    modal.querySelector("#info-close").addEventListener("click", close);
  }

  /* ================================
     MODAL DO MAPA
  ================================ */
  function openMapModal() {
    const overlay = document.createElement("div");
    overlay.className = "pi-overlay";

    const modal = document.createElement("div");
    modal.className = "pi-modal pi-map-modal";

    modal.innerHTML = `
      <img class="pi-map-img" src="${MAP_IMG}" alt="Mapa do Evento">
      <div class="pi-map-actions">
        <button id="map-close">Fechar</button>
      </div>
    `;

    document.body.append(overlay, modal);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      overlay.classList.add("active");
      modal.classList.add("active");
    });

    function close() {
      overlay.classList.remove("active");
      modal.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        modal.remove();
        document.body.style.overflow = prevOverflow;
      }, 250);
    }

    overlay.addEventListener("click", close);
    modal.querySelector("#map-close").addEventListener("click", close);
  }
});
