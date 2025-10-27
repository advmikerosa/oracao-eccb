import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Supabase client
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);
// State
let currentMonth = new Date();
let selectedDate = null;
let weekdaySelected = null; // 0-6 Sunday-Saturday
const WEEKDAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
// Helpers
function toDateStr(d) { return d.toISOString().slice(0,10); }
function minutesToHuman(min) { return min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min} min`; }

// Buscar orações (global)
let allPrayers = [];
async function atualizarOracoes() {
  const { data, error } = await supabase.from('escala_oracao').select('*').order('data', { ascending: false }).order('hora', { ascending: false });
  if (error) { console.error(error); return; }
  allPrayers = data || [];
}

// Painel diário (home)
function atualizarPainelDiario() {
  try {
    const todayStr = toDateStr(new Date());
    const hoje = allPrayers.filter(p => p.data === todayStr);
    // métricas
    const minutosHojeEl = document.getElementById('minutosHoje');
    const participantesHojeEl = document.getElementById('participantesHoje');
    const weeklyMinutesEl = document.getElementById('weeklyMinutes');
    const listaEl = document.getElementById('listaOradores');
    if (minutosHojeEl) minutosHojeEl.textContent = minutesToHuman(hoje.length * 5);
    if (participantesHojeEl) participantesHojeEl.textContent = String(hoje.length);
    if (listaEl) {
      if (hoje.length === 0) {
        listaEl.innerHTML = '<li class="text-gray-500 italic">Ninguém orou registrado ainda hoje.</li>';
      } else {
        // ordenar por hora asc
        const ordenado = [...hoje].sort((a,b) => a.hora.localeCompare(b.hora));
        listaEl.innerHTML = ordenado.map(p => `<li class="flex justify-between"><span class="font-medium text-teal-900">${p.nome}</span><span class="text-sm text-teal-700">${p.hora}</span></li>`).join('');
      }
    }
    // minutos na semana corrente (seg a dom)
    if (weeklyMinutesEl) {
      const now = new Date();
      const start = new Date(now);
      const day = (now.getDay()+6)%7; // seg=0..dom=6
      start.setDate(now.getDate() - day);
      start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(start.getDate()+6);
      const inWeek = allPrayers.filter(p => {
        const d = new Date(p.data+ 'T00:00:00');
        return d >= start && d <= end;
      });
      weeklyMinutesEl.textContent = minutesToHuman(inWeek.length * 5);
    }
  } catch(e) {
    console.warn('Falha ao atualizar painel diário', e);
  }
}

// Registrar oração rápida (5 min)
async function registrarOracao(event) {
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name) return alert('Por favor, digite seu nome ou apelido.');
  const now = new Date();
  const { error } = await supabase
    .from('escala_oracao')
    .insert([{ nome: name, data: toDateStr(now), hora: now.toTimeString().slice(0,8), responsavel: name, observacoes: '' }]);
  if (error) { alert('Erro ao registrar oração! Tente novamente.'); return; }
  nameInput.value = '';
  await atualizarOracoes();
  atualizarPainelDiario();
  await renderCalendar();
  if (weekdaySelected !== null) await renderWeekdaySummary(weekdaySelected); // keep weekday panel updated
}

// Agendar nova oração
async function scheduleNewPrayer(event) {
  event.preventDefault();
  const form = event.target;
  const nome = form.scheduleName.value.trim();
  const data = form.scheduleDate.value;
  const hora = form.scheduleTime.value;
  const responsavel = form.scheduleResponsavel.value.trim();
  const observacoes = form.scheduleNotes.value.trim();
  if (!nome || !data || !hora) return alert('Preencha nome, data e hora.');
  const { error } = await supabase
    .from('escala_oracao')
    .insert([{ nome, data, hora, responsavel: responsavel||nome, observacoes }]);
  if (error) { alert('Erro ao agendar oração!'); return; }
  form.reset();
  await atualizarOracoes();
  atualizarPainelDiario();
  await renderCalendar();
  if (weekdaySelected !== null) await renderWeekdaySummary(weekdaySelected);
}

// Render calendário
async function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  document.getElementById('currentMonthYear').textContent = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  const counts = {};
  allPrayers.forEach(p => { counts[p.data] = (counts[p.data] || 0) + 1; });
  for (let i = 0; i < firstDayWeek; i++) calendarGrid.innerHTML += '';
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dStr = toDateStr(d);
    const count = counts[dStr] || 0;
    const isToday = (new Date().toDateString() === d.toDateString());
    const isSelected = selectedDate && (selectedDate.toDateString() === d.toDateString());
    let classes = 'p-2 rounded-lg text-center cursor-pointer transition-all hover:bg-amber-100';
    if (isToday) classes += ' ring-2 ring-teal-500';
    if (isSelected) classes += ' bg-teal-500 text-white';
    else if (count > 0) classes += ' bg-amber-100 text-teal-900';
    else classes += ' bg-white text-gray-700';
    calendarGrid.innerHTML += `
      <div class="${classes}" data-date="${dStr}">
        <div class="font-semibold">${day}</div>
        ${count > 0 ? `<div class="text-xs text-teal-700">${count} • ${minutesToHuman(count*5)}</div>` : ''}
      </div>`;
  }
  document.querySelectorAll('[data-date]').forEach(cell => {
    cell.addEventListener('click', () => selectDate(new Date(cell.dataset.date + 'T00:00:00')));
  });
}

// Selecionar dia
async function selectDate(date) {
  selectedDate = date;
  weekdaySelected = null;
  const dateStr = toDateStr(date);
  const dayPrayers = allPrayers.filter(p => p.data === dateStr);
  document.getElementById('selectedDateDisplay').textContent = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('dayPrayerCount').textContent = dayPrayers.length.toString();
  document.getElementById('dayTotalMinutes').textContent = minutesToHuman(dayPrayers.length * 5);
  const listEl = document.getElementById('prayerList');
  if (dayPrayers.length === 0) listEl.innerHTML = '<p class="text-gray-500 italic">Nenhuma oração registrada neste dia.</p>';
  else {
    listEl.innerHTML = dayPrayers.map(p => `
      <div class="flex justify-between items-center bg-white border border-amber-200 rounded-lg px-3 py-2">
        <div>
          <div class="text-teal-900 font-semibold">${p.nome}</div>
          ${p.observacoes ? `<div class="text-gray-600 text-sm italic">${p.observacoes}</div>` : ''}
        </div>
        <div class="text-right text-sm text-teal-700">
          ${p.hora}
          ${p.responsavel}
        </div>
      </div>`).join('');
  }
  document.getElementById('weekdayDetails').classList.add('hidden');
  document.getElementById('dateDetails').classList.remove('hidden');
  await renderCalendar();
}

// Render resumo dia da semana
async function renderWeekdaySummary(weekday) {
  weekdaySelected = weekday;
  selectedDate = null;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const counts = {};
  allPrayers.forEach(p => { counts[p.data] = (counts[p.data] || 0) + 1; });
  // Build list of all weekday occurrences in this month
  const occurrences = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekday) occurrences.push(new Date(d));
  }
  // Compute totals and render
  const totalPrayers = occurrences.reduce((acc, d) => acc + (counts[toDateStr(d)] || 0), 0);
  const totalMinutes = totalPrayers * 5;
  const panel = document.getElementById('weekdayDetails');
  const title = document.getElementById('weekdayTitle');
  const countEl = document.getElementById('weekdayPrayerCount');
  const minEl = document.getElementById('weekdayTotalMinutes');
  const listEl = document.getElementById('weekdayOccurrences');
  title.textContent = `${WEEKDAY_LABELS[weekday]}s deste mês`;
  countEl.textContent = totalPrayers.toString();
  minEl.textContent = minutesToHuman(totalMinutes);
  listEl.innerHTML = occurrences.map(d => {
    const c = counts[toDateStr(d)] || 0;
    return `
      <div class="flex justify-between items-center bg-white border border-amber-200 rounded-lg px-3 py-2">
        <span class="text-teal-900">${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
        <span class="text-teal-800 font-semibold">${c} • ${minutesToHuman(c*5)}</span>
      </div>`;
  }).join('');
  panel.classList.remove('hidden');
}

// Ir para Hoje
function goToToday() {
  const today = new Date();
  currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar().then(() => {
    selectDate(today);
  });
}

// Navegação mês
function prevMonth() { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar().then(() => { if (weekdaySelected!==null) renderWeekdaySummary(weekdaySelected); }); }
function nextMonth() { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar().then(() => { if (weekdaySelected!==null) renderWeekdaySummary(weekdaySelected); }); }

// Wire-up
function wireEvents() {
  document.getElementById('prevMonth').addEventListener('click', prevMonth);
  document.getElementById('nextMonth').addEventListener('click', nextMonth);
  document.getElementById('formOracao').addEventListener('submit', registrarOracao);
  document.getElementById('scheduleForm').addEventListener('submit', scheduleNewPrayer);
  document.getElementById('goToToday').addEventListener('click', goToToday);
  document.querySelectorAll('.weekday-btn').forEach(btn => {
    btn.addEventListener('click', () => renderWeekdaySummary(parseInt(btn.dataset.weekday)));
  });
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  wireEvents();
  await atualizarOracoes();
  atualizarPainelDiario();
  renderCalendar();
});
