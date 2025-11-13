// app.js - SignalR connection and UI glue for feed and users
const feedEl = document.getElementById('feed');
const usersListEls = [
  document.getElementById('usersList'),
  document.getElementById('usersListCP'),
  document.getElementById('usersListAlerts'),
  document.getElementById('usersListEvents')
].filter(Boolean);

// state
let username = localStorage.getItem('uniconnect.username') || null;
const users = new Set();

// build connection
const connection = new signalR.HubConnectionBuilder().withUrl('/notifyHub').withAutomaticReconnect().build();

connection.onreconnecting(err => console.warn('Reconnecting...', err));
connection.onreconnected(() => {
  if (username) registerPresence(username);
});
connection.start()
  .then(() => {
    console.log('SignalR connected');
    if (username) registerPresence(username);
  })
  .catch(err => console.error(err));

// handle incoming posts
connection.on('ReceiveMessage', (user, text) => {
  appendPost(user, text);
});

// presence events
connection.on('UserConnected', (user) => {
  users.add(user);
  renderUsers();
});
connection.on('UserDisconnected', (user) => {
  users.delete(user);
  renderUsers();
});

// helpers
function appendPost(user, text) {
  const post = document.createElement('div');
  post.className = 'post';
  const initial = (user && user[0]) ? user[0].toUpperCase() : '?';
  const title = (text && text.split('\n')[0]) || '';
  post.innerHTML = `
    <div class="post-header">
      <div class="avatar">${initial}</div>
      <div>
        <div class="username">${escapeHtml(user)}</div>
        <div class="course muted">${escapeHtml(title)}</div>
      </div>
    </div>
    <div class="post-body"><p>${escapeHtml(text)}</p></div>
  `;
  feedEl.prepend(post);
}

// render users list in all sidebars present
function renderUsers(){
  usersListEls.forEach(listEl => {
    listEl.innerHTML = '';
    [...users].reverse().forEach(u => {
      const li = document.createElement('li');
      li.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:var(--yellow);display:flex;align-items:center;justify-content:center">${escapeHtml(u[0]||'?')}</div>
        <div><strong>${escapeHtml(u)}</strong><div class="muted small">online</div></div>`;
      listEl.appendChild(li);
    });
  });
}

// escape
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// presence - call hub method 'Register' (server must implement)
function registerPresence(name){
  try {
    connection.invoke('Register', name).catch(err => console.error('Register err', err));
    localStorage.setItem('uniconnect.username', name);
    username = name;
  } catch(e){ console.error(e) }
}

// login modal
const loginModal = document.getElementById('loginModal');
const btnLogin = document.getElementById('btnLogin');
const btnLogin2 = document.getElementById('btnLogin2');
const btnLogin3 = document.getElementById('btnLogin3');
const btnLogin4 = document.getElementById('btnLogin4');
const loginName = document.getElementById('loginName');
const loginSubmit = document.getElementById('loginSubmit');
const loginClose = document.getElementById('loginClose');

[btnLogin, btnLogin2, btnLogin3, btnLogin4].forEach(b=>{
  if(!b) return;
  b.addEventListener('click', ()=> {
    loginModal.classList.remove('hidden');
  });
});
if(loginClose) loginClose.addEventListener('click', ()=> loginModal.classList.add('hidden'));
if(loginSubmit){
  loginSubmit.addEventListener('click', ()=> {
    const name = (loginName.value || '').trim();
    if(!name) { alert('Digite um nome'); return; }
    registerPresence(name);
    loginModal.classList.add('hidden');
  });
}

// if already have username in storage, try register
if(username) {
  // delay a bit to ensure connection established
  setTimeout(()=> registerPresence(username), 500);
}
