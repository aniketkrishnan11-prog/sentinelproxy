const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('welcomeMsg').textContent = `Logged in as ${user.username}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

async function loadNotes() {
  const res = await fetch('/api/notes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  renderNotes(data.notes);
}

function renderNotes(notes) {
  const container = document.getElementById('notesList');

  container.innerHTML = notes.map(note => `
    <div class="note">
      <h3>${note.title}</h3>
      <p>${note.content || ''}</p>
      <small>${new Date(note.created_at).toLocaleString()}</small>
    </div>
  `).join('');
}

document.getElementById('noteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  loadNotes();
});

document.getElementById('searchBtn').addEventListener('click', async () => {
  const q = document.getElementById('searchBox').value;
  const res = await fetch(`/api/notes/search/query?q=${encodeURIComponent(q)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  renderNotes(data.notes);
});

loadNotes();
