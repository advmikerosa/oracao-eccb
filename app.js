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
  await renderCalendar();
  if (weekdaySelected !== null) await renderWeekdaySummary(weekdaySelected); // keep weekday panel updated
}

// Painel Hoje/Semana e lista do dia
async function atualizarOracoes() {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());

  const { data: oracoesHoje = [] } = await supabase.from('escala_oracao').select('*').eq('data', toDateStr(hoje));
  const { data: oracoesSemana = [] } = await supabase.from('escala_oracao').select('*').gte('data', toDateStr(inicioSemana));

  document.getElementById('minutosHoje').textContent = (oracoesHoje.length * 5).toString();
  document.getElementById('participantesHoje').textContent = oracoesHoje.length.toString();
  document.getElementById('weeklyMinutes').textContent = (oracoesSemana.length * 5).toString();

  const listaEl = document.getElementById('listaOradores');
  if (oracoesHoje.length === 0) {
    listaEl.innerHTML = `<p class="italic text-amber-400 text-base empty-state">Nenhuma oração registrada ainda. Seja o primeiro!</p>`;
  } else {
    listaEl.innerHTML = oracoesHoje.map(item =>
      `<div class="w-full bg-white rounded-lg border border-amber-200 text-teal-900 text-base px-3 py-1 shadow animate-fadeIn">${item.nome}</div>`
    ).join('');
  }
}

// Renderização do calendário
async function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const startDate = toDateStr(firstDay);
  const endDate = toDateStr(lastDay);

  const { data: prayersInMonth = [] } = await supabase
    .from('escala_oracao')
    .select('data')
    .gte('data', startDate)
    .lte('data', endDate);

  const { data: scheduledPrayers = [] } = await supabase
    .from('oracoes_agendadas')
    .select('data')
    .gte('data', startDate)
    .lte('data', endDate);

  const prayersByDay = {};
  prayersInMonth.forEach(p => { const d = new Date(p.data).getDate(); prayersByDay[d] = (prayersByDay[d] || 0) + 1; });
  const scheduledByDay = {};
  scheduledPrayers.forEach(p => { const d = new Date(p.data).getDate(); scheduledByDay[d] = (scheduledByDay[d] || 0) + 1; });

  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';

  for (let i = 0; i < startDayOfWeek; i++) {
    const empty = document.createElement('div'); empty.className = 'h-12'; calendarGrid.appendChild(empty);
  }

  const today = new Date(); today.setHours(0,0,0,0);
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day); dayDate.setHours(0,0,0,0);
    const isToday = dayDate.getTime() === today.getTime();
    const prayerCount = prayersByDay[day] || 0;
    const scheduledCount = scheduledByDay[day] || 0;

    const btn = document.createElement('button');
    btn.className = `h-12 rounded-lg border transition relative ${isToday ? 'border-amber-500 bg-amber-100 font-bold' : 'border-amber-200 bg-white hover:bg-amber-50'}`;
    btn.innerHTML = `
      <div class="text-sm ${isToday ? 'text-amber-700' : 'text-teal-900'}">${day}</div>
      ${prayerCount > 0 ? '<div class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full m-1"></div>' : ''}
      ${scheduledCount > 0 ? '<div class="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-1"></div>' : ''}
    `;
    btn.addEventListener('click', () => selectDate(new Date(year, month, day)));
    calendarGrid.appendChild(btn);
  }
}

// Seleção de um dia específico
async function selectDate(date) {
  selectedDate = date;
  const dateStr = toDateStr(date);
  const dayDetails = document.getElementById('dayDetails'); dayDetails.classList.remove('hidden');
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('selectedDate').textContent = date.toLocaleDateString('pt-BR', dateOptions);

  const { data: prayers = [] } = await supabase.from('escala_oracao').select('*').eq('data', dateStr);
  const totalMinutes = prayers.length * 5;
  document.getElementById('dayPrayerCount').textContent = prayers.length.toString();
  document.getElementById('dayTotalMinutes').textContent = minutesToHuman(totalMinutes);

  await loadScheduledPrayers(dateStr);
  dayDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Lista agendada do dia
async function loadScheduledPrayers(dateStr) {
  const { data: scheduled = [] } = await supabase
    .from('oracoes_agendadas')
    .select('*')
    .eq('data', dateStr)
    .order('horario', { ascending: true });
  const scheduledList = document.getElementById('scheduledList');
  if (scheduled.length === 0) {
    scheduledList.innerHTML = '<p class="text-sm text-teal-600 italic">Nenhuma oração agendada para este dia.</p>';
  } else {
    scheduledList.innerHTML = scheduled.map(item => `
      <div class="flex justify-between items-center bg-white border border-teal-200 rounded-lg px-3 py-2">
        <div>
          <span class="font-semibold text-teal-900">${item.horario.slice(0,5)}</span>
          <span class="text-teal-700 ml-2">${item.nome}</span>
        </div>
        <button class="text-red-500 hover:text-red-700 text-sm" onclick="deleteScheduled(${item.id})">✕</button>
      </div>
    `).join('');
  }
}

// Agendar nova oração
async function scheduleNewPrayer(event) {
  event.preventDefault();
  if (!selectedDate) { alert('Por favor, selecione uma data no calendário primeiro.'); return; }

  const time = document.getElementById('scheduleTime').value;
  const name = document.getElementById('scheduleName').value.trim();
  if (!time || !name) { alert('Por favor, preencha todos os campos.'); return; }

  const dateStr = toDateStr(selectedDate);
  const { error } = await supabase.from('oracoes_agendadas').insert([{ data: dateStr, horario: `${time}:00`, nome: name }]);
  if (error) { alert('Erro ao agendar oração! Tente novamente.'); return; }

  document.getElementById('scheduleTime').value = '';
  document.getElementById('scheduleName').value = '';
  await loadScheduledPrayers(dateStr);
  await renderCalendar();
}

// Remover agendamento
window.deleteScheduled = async function(id) {
  if (!confirm('Deseja remover esta oração agendada?')) return;
  const { error } = await supabase.from('oracoes_agendadas').delete().eq('id', id);
  if (error) { alert('Erro ao remover oração agendada!'); return; }
  const dateStr = toDateStr(selectedDate);
  await loadScheduledPrayers(dateStr);
  await renderCalendar();
};

// Weekday summary (Dom-Sáb)
async function renderWeekdaySummary(weekday) {
  weekdaySelected = weekday;
  // Toggle active styles
  document.querySelectorAll('.weekday-btn').forEach(btn => {
    if (parseInt(btn.dataset.weekday) === weekday) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Query month range
  const { data: prayers = [] } = await supabase
    .from('escala_oracao')
    .select('data')
    .gte('data', toDateStr(firstDay))
    .lte('data', toDateStr(lastDay));

  // Build map dateStr -> count for this weekday
  const counts = {}; // dateStr => number
  prayers.forEach(p => {
    const d = new Date(p.data); if (d.getDay() !== weekday) return;
    const key = toDateStr(d); counts[key] = (counts[key] || 0) + 1;
  });

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
  const t = new Date();
  t.setHours(0,0,0,0);
  currentMonth = new Date(t.getFullYear(), t.getMonth(), 1);
  renderCalendar().then(() => selectDate(t));
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
  const todayBtn = document.getElementById('goToToday');
  if (todayBtn) todayBtn.addEventListener('click', goToToday);
  document.querySelectorAll('.weekday-btn').forEach(btn => {
    btn.addEventListener('click', () => renderWeekdaySummary(parseInt(btn.dataset.weekday)));
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  atualizarOracoes();
  renderCalendar();
});
