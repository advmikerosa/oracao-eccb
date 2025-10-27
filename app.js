import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);

// Variables for calendar state
let currentMonth = new Date();
let selectedDate = null;

async function registrarOracao(event) {
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name) return alert('Por favor, digite seu nome ou apelido.');
  const now = new Date();
  const hojeStr = now.toISOString().slice(0, 10);
  const horaStr = now.toTimeString().slice(0, 8);
  const { error } = await supabase
    .from('escala_oracao')
    .insert([{
      nome: name,
      data: hojeStr,
      hora: horaStr,
      responsavel: name,
      observacoes: ''
    }]);
  if (error) {
    alert('Erro ao registrar oração! Tente novamente.');
    return;
  }
  nameInput.value = '';
  await atualizarOracoes();
  await renderCalendar(); // Update calendar after prayer
}

async function atualizarOracoes() {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const { data: oracoesHoje = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .eq('data', hoje.toISOString().slice(0, 10));
  const { data: oracoesSemana = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .gte('data', inicioSemana.toISOString().slice(0, 10));
  document.getElementById('minutosHoje').textContent = oracoesHoje.length * 5;
  document.getElementById('participantesHoje').textContent = oracoesHoje.length;
  document.getElementById('weeklyMinutes').textContent = oracoesSemana.length * 5;
  const listaEl = document.getElementById('listaOradores');
  if (oracoesHoje.length === 0) {
    listaEl.innerHTML = `<p class="italic text-amber-400 text-base empty-state">Nenhuma oração registrada ainda. Seja o primeiro!</p>`;
  } else {
    listaEl.innerHTML = oracoesHoje.map(item =>
      `<div class="w-full bg-white rounded-lg border border-amber-200 text-teal-900 text-base px-3 py-1 shadow animate-fadeIn">${item.nome}</div>`
    ).join('');
  }
}

// Calendar Functions
async function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Update month display
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  // Get first and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Fetch prayer data for the month
  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  
  const { data: prayersInMonth = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .gte('data', startDate)
    .lte('data', endDate);
  
  const { data: scheduledPrayers = [] } = await supabase
    .from('oracoes_agendadas')
    .select('*')
    .gte('data', startDate)
    .lte('data', endDate);
  
  // Count prayers per day
  const prayersByDay = {};
  prayersInMonth.forEach(prayer => {
    const day = new Date(prayer.data).getDate();
    prayersByDay[day] = (prayersByDay[day] || 0) + 1;
  });
  
  const scheduledByDay = {};
  scheduledPrayers.forEach(prayer => {
    const day = new Date(prayer.data).getDate();
    scheduledByDay[day] = (scheduledByDay[day] || 0) + 1;
  });
  
  // Render calendar grid
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'h-12';
    calendarGrid.appendChild(emptyCell);
  }
  
  // Add day cells
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    const isToday = dayDate.getTime() === today.getTime();
    const prayerCount = prayersByDay[day] || 0;
    const scheduledCount = scheduledByDay[day] || 0;
    
    const dayCell = document.createElement('button');
    dayCell.className = `h-12 rounded-lg border transition relative ${
      isToday ? 'border-amber-500 bg-amber-100 font-bold' : 'border-amber-200 bg-white hover:bg-amber-50'
    }`;
    dayCell.innerHTML = `
      <div class="text-sm ${isToday ? 'text-amber-700' : 'text-teal-900'}">${day}</div>
      ${prayerCount > 0 ? `<div class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full m-1"></div>` : ''}
      ${scheduledCount > 0 ? `<div class="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-1"></div>` : ''}
    `;
    dayCell.onclick = () => selectDate(new Date(year, month, day));
    calendarGrid.appendChild(dayCell);
  }
}

async function selectDate(date) {
  selectedDate = date;
  const dateStr = date.toISOString().slice(0, 10);
  
  // Show day details section
  const dayDetails = document.getElementById('dayDetails');
  dayDetails.classList.remove('hidden');
  
  // Format and display selected date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('selectedDate').textContent = date.toLocaleDateString('pt-BR', dateOptions);
  
  // Fetch prayers for this day
  const { data: prayers = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .eq('data', dateStr);
  
  const totalMinutes = prayers.length * 5;
  document.getElementById('dayPrayerCount').textContent = prayers.length;
  document.getElementById('dayTotalMinutes').textContent = totalMinutes >= 60 
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`
    : `${totalMinutes} min`;
  
  // Fetch and display scheduled prayers
  await loadScheduledPrayers(dateStr);
  
  // Scroll to details
  dayDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

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
          <span class="font-semibold text-teal-900">${item.horario.slice(0, 5)}</span>
          <span class="text-teal-700 ml-2">${item.nome}</span>
        </div>
        <button onclick="deleteScheduled(${item.id})" class="text-red-500 hover:text-red-700 text-sm">✕</button>
      </div>
    `).join('');
  }
}

async function scheduleNewPrayer(event) {
  event.preventDefault();
  
  if (!selectedDate) {
    alert('Por favor, selecione uma data no calendário primeiro.');
    return;
  }
  
  const time = document.getElementById('scheduleTime').value;
  const name = document.getElementById('scheduleName').value.trim();
  
  if (!time || !name) {
    alert('Por favor, preencha todos os campos.');
    return;
  }
  
  const dateStr = selectedDate.toISOString().slice(0, 10);
  
  const { error } = await supabase
    .from('oracoes_agendadas')
    .insert([{
      data: dateStr,
      horario: time + ':00',
      nome: name
    }]);
  
  if (error) {
    console.error('Error scheduling prayer:', error);
    alert('Erro ao agendar oração! Tente novamente.');
    return;
  }
  
  // Clear form
  document.getElementById('scheduleTime').value = '';
  document.getElementById('scheduleName').value = '';
  
  // Reload scheduled prayers and calendar
  await loadScheduledPrayers(dateStr);
  await renderCalendar();
}

window.deleteScheduled = async function(id) {
  if (!confirm('Deseja remover esta oração agendada?')) return;
  
  const { error } = await supabase
    .from('oracoes_agendadas')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Erro ao remover oração agendada!');
    return;
  }
  
  const dateStr = selectedDate.toISOString().slice(0, 10);
  await loadScheduledPrayers(dateStr);
  await renderCalendar();
};

// Navigation
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

// Event Listeners
document.getElementById('formOracao').addEventListener('submit', registrarOracao);
document.getElementById('scheduleForm').addEventListener('submit', scheduleNewPrayer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  atualizarOracoes();
  renderCalendar();
});
