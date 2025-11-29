const API = 'http://localhost:3000/api';
const tokenKey = 'teleton_token';

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('login');
const dashSection = document.getElementById('dashboard');
const loginError = document.getElementById('loginError');

function setToken(t){ localStorage.setItem(tokenKey, t); }
function getToken(){ return localStorage.getItem(tokenKey); }
function authHeaders(){ return { 'Authorization': 'Bearer ' + getToken() }; }

async function apiGet(path){
  const res = await fetch(API + path, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error');
  return res.json();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Login inválido');
    setToken(data.token);
    loginSection.classList.add('hidden');
    dashSection.classList.remove('hidden');
    initDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

async function initDashboard(){
  const total = await apiGet('/metrics/voluntarios/count');
  document.getElementById('totalVoluntarios').textContent = String(total.total);
  const asistencia = await apiGet('/metrics/asistencia');
  document.getElementById('tasaAsistencia').textContent = Math.round((asistencia.tasa||0)*100) + '%';
  const heat = await apiGet('/metrics/voluntarios/heatmap');
  renderMap(heat.points);
  const timeline = await apiGet('/metrics/participacion/timeline');
  renderTimeline(timeline.points);
}

function renderMap(points){
  const map = L.map('map').setView([-35.6751, -71.5430], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  for (const p of points){
    const radius = 20000 + Math.min(80000, p.count*5000);
    L.circle([p.lat, p.lng], { radius, color: '#E60000', fillColor: '#E60000', fillOpacity: 0.35 }).addTo(map).bindPopup(p.region + ' (' + p.count + ')');
  }
}

function renderTimeline(points){
  const ctx = document.getElementById('timeline');
  const labels = points.map(p => p.period);
  const data = points.map(p => p.value);
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Participación', data, borderColor: '#007ACC', backgroundColor: '#F5F5F5' }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

if (getToken()) { loginSection.classList.add('hidden'); dashSection.classList.remove('hidden'); initDashboard(); }
