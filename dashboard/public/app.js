const API_BASE = 'http://localhost:4000';

async function loadStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  const data = await res.json();

  document.getElementById('totalCount').textContent = data.total;
  document.getElementById('blockedCount').textContent = data.blocked;
  document.getElementById('allowedCount').textContent = data.total - data.blocked;
}

async function loadLogs() {
  const res = await fetch(`${API_BASE}/api/logs?limit=30`);
  const data = await res.json();
  renderLogs(data.logs);
}

function renderLogs(logs) {
  const tbody = document.getElementById('logsTable');
  // Using textContent per-cell here, not innerHTML — deliberately the
  // OPPOSITE pattern from your target app's notes.html. This dashboard
  // renders data from your own trusted detection pipeline, but it's
  // still good practice, and it's worth being able to point out in an
  // interview that you applied the lesson from the target app's XSS bug
  // here, consciously.
  tbody.innerHTML = '';
  logs.forEach(log => {
    const row = document.createElement('tr');

    const cells = [
      new Date(log.created_at).toLocaleTimeString(),
      log.source_ip || '-',
      log.method,
      log.path,
      log.verdict,
      log.mitre_technique || '-'
    ];

    cells.forEach((val, i) => {
      const td = document.createElement('td');
      td.textContent = val;
      if (i === 4) td.className = `verdict-${log.verdict}`;
      if (i === 5 && log.mitre_technique) td.innerHTML = `<span class="technique-tag"></span>`;
      if (i === 5 && log.mitre_technique) td.querySelector('.technique-tag').textContent = log.mitre_technique;
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
}

// Live updates via WebSocket
const ws = new WebSocket('ws://localhost:4000');
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'new_logs') {
    loadStats();
    loadLogs();
  }
};

loadStats();
loadLogs();
setInterval(loadStats, 5000); // fallback refresh even if WS misses something
