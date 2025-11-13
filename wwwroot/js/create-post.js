document.getElementById('publishBtn').addEventListener('click', async () => {
  const title = document.getElementById('postTitle').value.trim();
  const body = document.getElementById('postBody').value.trim();
  const course = document.getElementById('postCourse').value.trim();
  const emoji = document.getElementById('postEmoji').value.trim();

  if (!title || !body) {
    alert('Preencha título e conteúdo!');
    return;
  }

  const post = { title, body, course, emoji };

  try {
    const response = await fetch('http://localhost:8080/api/posts', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });

    if (response.ok) {
      alert('Post publicado com sucesso!');
      window.location.href = './painel.html';
    } else {
      const error = await response.text();
      alert('Erro: ' + error);
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao conectar com o servidor.');
  }
});
