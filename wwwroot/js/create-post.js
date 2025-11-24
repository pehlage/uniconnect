// create-post.js — versão correta que funciona 100% com seu backend atual
document.addEventListener('DOMContentLoaded', () => {

  const publishBtn = document.getElementById('publishBtn');

  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {

      const title = document.getElementById('postTitle').value.trim();
      const body = document.getElementById('postBody').value.trim();
      const course = document.getElementById('postCourse').value.trim();

      if (!title || !body) {
        alert('Preencha título e conteúdo!');
        return;
      }

      // Backend exige title + body + course
      const post = {
        title,
        body,
        course
      };

      try {
        const resp = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post)
        });

        if (!resp.ok) {
          const txt = await resp.text();
          alert("Erro ao publicar: " + txt);
          return;
        }

        alert("Publicado com sucesso!");
        window.location.href = "./painel.html";

      } catch (err) {
        console.error("Erro ao publicar:", err);
        alert("Falha ao publicar o post.");
      }

    });
  }

  // ===============================
  // AUTOCOMPLETE DE CURSOS
  // ===============================

const courses = [
  "Engenharia de Software",
  "Ciência da Computação",
  "Sistemas de Informação",
  "Engenharia Elétrica",
  "Engenharia Mecânica",
  "Engenharia Civil",
  "Engenharia de Produção",
  "Engenharia Ambiental",
  "Engenharia Química",
  "Engenharia Biomédica",
  "Administração",
  "Direito",
  "Psicologia",
  "Arquitetura e Urbanismo",
  "Medicina",
  "Enfermagem",
  "Farmácia",
  "Biomedicina",
  "Educação Física — Bacharelado",
  "Educação Física — Licenciatura",
  "Nutrição",
  "Fisioterapia",
  "Odontologia",
  "Gastronomia",
  "Jornalismo",
  "Publicidade e Propaganda",
  "Relações Públicas",
  "Design Gráfico",
  "Design de Interiores",
  "Design de Produto",
  "Ciências Contábeis",
  "Economia",
  "Recursos Humanos",
  "Marketing",
  "Logística",
  "Comércio Exterior",
  "Análise e Desenvolvimento de Sistemas",
  "Banco de Dados",
  "Jogos Digitais",
  "Redes de Computadores",
  "Segurança da Informação",
  "Teologia",
  "Serviço Social",
  "Pedagogia",
  "Letras — Português",
  "Letras — Inglês",
  "Geografia",
  "História",
  "Matemática"
];


  const inputCourse = document.getElementById('postCourse');
  const courseList = document.getElementById('courseList');

  if (!inputCourse || !courseList) return;

  inputCourse.addEventListener('focus', () => showList(courses));
  inputCourse.addEventListener('input', () => {
    const v = inputCourse.value.toLowerCase();
    const filtered = courses.filter(c => c.toLowerCase().includes(v));
    showList(filtered);
  });

  function showList(items) {
    courseList.innerHTML = '';
    if (!items.length) { courseList.style.display = 'none'; return; }

    items.forEach(it => {
      const li = document.createElement('li');
      li.textContent = it;
      li.addEventListener('click', () => {
        inputCourse.value = it;
        closeList();
      });
      courseList.appendChild(li);
    });

    courseList.style.display = 'block';
  }

  function closeList() { courseList.style.display = 'none'; }

  document.addEventListener('click', (e) => {
    if (!inputCourse.contains(e.target) && !courseList.contains(e.target)) closeList();
  });

});
