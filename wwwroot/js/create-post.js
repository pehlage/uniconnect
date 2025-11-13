// create-post.js - handle create post form and publish to /notify
document.addEventListener('DOMContentLoaded', () => {
  const publishBtn = document.getElementById('publishBtn');
  const title = document.getElementById('postTitle');
  const body = document.getElementById('postBody');
  const course = document.getElementById('postCourse');
  const emoji = document.getElementById('postEmoji');

  publishBtn.addEventListener('click', async () => {
    const user = localStorage.getItem('uniconnect.username') || 'Anônimo';
    if(!body.value.trim()) return alert('Escreva algo para publicar');
    const text = `${title.value || ''}\n${body.value.trim()}\n${course.value ? '('+course.value+')':''} ${emoji.value||''}`;
    try {
      const resp = await fetch('/notify', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ user, text })
      });
      if(resp.ok){
        alert('Post publicado!');
        title.value=''; body.value=''; course.value=''; emoji.value='';
        window.location.href = '/index.html';
      } else {
        alert('Erro ao publicar');
      }
    } catch(e){ console.error(e); alert('Erro ao publicar') }
  });
});
