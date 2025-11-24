document.addEventListener("DOMContentLoaded", () => {
  const usersList = document.getElementById("usersListAlerts");
  if (!usersList) return;

  const mockNames = [
    "Ana Martins", "Carlos Eduardo", "Fernanda Lopes", "João Victor",
    "Mariana Albuquerque", "Roberto Silva", "Clara Monteiro", "Lucas Pereira",
    "Beatriz Souza", "Gustavo Andrade", "Daniela Ramos", "Felipe Cardoso",
    "Juliana Teixeira", "Renato Azevedo", "Patrícia Mendes", "Vinicius Barros",
    "Isabela Castro", "Thiago Moreira", "Camila Duarte", "Rafaela Nunes",
    "André Carvalho", "Letícia Farias", "Bruno Oliveira", "Carolina Torres",
    "Eduardo Matos", "Larissa Moura", "Marcelo Fagundes", "Sabrina Pacheco",
    "Hugo Nascimento", "Natália Ribeiro", "Pedro Henrique", "Victoria Lemos",
    "Samuel Costa", "Alice Ferreira", "Henrique Guimarães", "Flávia Dias",
    "Rodrigo Passos", "Érica Mendes", "Fábio Rezende", "Tatiane Alves",
    "Leonardo Batista", "Jéssica Lima", "Ricardo Fonseca", "Nathalia Duarte",
    "Diego Barcellos", "Priscila Monteiro", "Jonathan Alves", "Carla Queiroz",
    "Murilo Rocha", "Helena Moretti"
  ];

  const total = 10;

  const shuffled = mockNames
    .map(n => ({ n, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, total)
    .map(a => a.n);

  const getRandomColor = () => {
    const colors = ["#0ea5e9", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomStatus = () => {
    return Math.random() > 0.7
      ? { class: "status-away", text: "Ausente" }   // amarelo
      : { class: "status-online", text: "Online" }; // verde
  };

  shuffled.forEach(name => {
    const li = document.createElement("li");

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.style.background = getRandomColor();
    avatar.textContent = name.charAt(0);

    const infoWrap = document.createElement("div");

    const nameSpan = document.createElement("div");
    nameSpan.textContent = name;

    const statusWrap = document.createElement("div");
    statusWrap.className = "user-status";

    const status = getRandomStatus();

    const dot = document.createElement("div");
    dot.className = `status-dot ${status.class}`;

    const statusText = document.createElement("span");
    statusText.textContent = status.text;

    statusWrap.appendChild(dot);
    statusWrap.appendChild(statusText);

    infoWrap.appendChild(nameSpan);
    infoWrap.appendChild(statusWrap);

    li.appendChild(avatar);
    li.appendChild(infoWrap);

    usersList.appendChild(li);
  });
});
