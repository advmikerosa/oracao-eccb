import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Supabase client
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);
// State
let currentMonth = new Date();
currentMonth.setDate(1);
let selectedDate = new Date();
// Helpers
const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTH_LABELS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function toDateStr(d) { return d.toISOString().slice(0,10); }
function minutesToHuman(min) { return min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min} min`; }
function startOfWeek(d){ const x=new Date(d); const day=(x.getDay()+7)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
function endOfWeek(d){ const s=startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
function startOfMonth(d){ const x=new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d){ const x=new Date(d.getFullYear(), d.getMonth()+1, 0); x.setHours(23,59,59,999); return x; }
// Data cache
let allPrayers = [];
async function atualizarOracoes() {
  const { data, error } = await supabase
    .from('escala_oracao')
    .select('*');
  if (error) { console.error(error); return; }
  allPrayers = data || [];
}
// Aggregations
function getTotalsForDate(date){
  const ds = toDateStr(date);
  const list = allPrayers.filter(p => p.data === ds);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: list.length, list };
}
function getTotalsForRange(start, end){
  const s = toDateStr(start); const e = toDateStr(end);
  const list = allPrayers.filter(p => p.data >= s && p.data <= e);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: new Set(list.map(p=>p.nome)).size };
}
function getTotalsForMonth(d){
  return getTotalsForRange(startOfMonth(d), endOfMonth(d));
}
function getTotalsForWeek(d){
  return getTotalsForRange(startOfWeek(d), endOfWeek(d));
}
// UI Update: Stats cards
function atualizarCardsResumo(baseDate){
  const { totalMin: todayMin } = getTotalsForDate(baseDate);
  const { totalMin: weekMin, count: weekCount } = getTotalsForWeek(baseDate);
  const { totalMin: monthMin, count: monthCount } = getTotalsForMonth(baseDate);
  const todayEl = document.getElementById('todayTotal');
  const weekEl = document.getElementById('weekTotal');
  const monthEl = document.getElementById('monthTotal');
  const tc = document.getElementById('todayCount');
  const wc = document.getElementById('weekCount');
  const mc = document.getElementById('monthCount');
  if (todayEl) todayEl.textContent = minutesToHuman(todayMin);
  if (weekEl) weekEl.textContent = minutesToHuman(weekMin);
  if (monthEl) monthEl.textContent = minutesToHuman(monthMin);
  // For cards we continue to show unique counts for week/month
  if (wc) wc.textContent = `${weekCount} ${weekCount===1?'pessoa':'pessoas'}`;
  if (mc) mc.textContent = `${monthCount} ${monthCount===1?'pessoa':'pessoas'}`;
}
// Calendar build
function buildCalendar(){
  const monthTitle = document.getElementById('calendarMonth');
  const daysGrid = document.getElementById('calendarDays');
  if (!monthTitle || !daysGrid) return;
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  monthTitle.textContent = `${MONTH_LABELS[m]} ${y}`;
  daysGrid.innerHTML = '';
  const firstDay = new Date(y, m, 1);
  const startPadding = (firstDay.getDay()+7)%7; // dom=0
  const lastDate = new Date(y, m+1, 0).getDate();
  // Helper: get total for a day quickly
  function dayTotal(date){ return getTotalsForDate(date).totalMin; }
  // Fill blanks before first
  for (let i=0;i<startPadding;i++){
    const cell = document.createElement('button');
    cell.className = 'aspect-square rounded-lg p-2 opacity-0 cursor-default';
    cell.tabIndex = -1;
    daysGrid.appendChild(cell);
  }
  const today = new Date(); today.setHours(0,0,0,0);
  for (let d=1; d<=lastDate; d++){
    const date = new Date(y, m, d);
    const total = dayTotal(date);
    const btn = document.createElement('button');
    btn.className = 'relative aspect-square rounded-lg p-2 text-left border hover:shadow transition bg-white/70 border-amber-200 hover:bg-white';
    // Top row: date number
    const num = document.createElement('div');
    num.className = 'text-sm font-semibold text-amber-800';
    num.textContent = String(d);
    btn.appendChild(num);
    // Bottom: total minutes small chip
    const chip = document.createElement('div');
    chip.className = 'absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200';
    chip.textContent = total ? minutesToHuman(total) : '—';
    btn.appendChild(chip);
    // Highlight today
    const isToday = date.getTime() === today.getTime();
    if (isToday) {
      btn.classList.add('ring-2','ring-teal-500');
    }
    btn.addEventListener('click', ()=> openDayPanel(date));
    daysGrid.appendChild(btn);
  }
}
// Day Panel
function renderParticipants(list){
  const cont = document.getElementById('dayPanelParticipants');
  if (!cont) return;
  cont.innerHTML = '';
  if (list.length === 0){
    const el = document.createElement('div');
    el.className = 'text-sm text-blue-700 italic';
    el.textContent = 'Nenhum registro para este dia.';
    cont.appendChild(el);
    return;
  }
  const byHour = [...list].sort((a,b)=> (a.hora||'').localeCompare(b.hora||''));
  byHour.forEach(p=>{
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center bg-white/70 border border-blue-200 rounded-lg px-3 py-2';
    const left = document.createElement('div'); left.className='text-blue-900 font-medium truncate'; left.textContent=p.nome;
    const right = document.createElement('div'); right.className='text-blue-800 font-semibold tabular-nums'; right.textContent=p.hora||'';
    row.appendChild(left); row.appendChild(right);
    cont.appendChild(row);
  });
}
function openDayPanel(date){
  selectedDate = new Date(date);
  const panel = document.getElementById('dayPanel');
  const dateEl = document.getElementById('dayPanelDate');
  const totalEl = document.getElementById('dayPanelTotal');
  const countEl = document.getElementById('dayPanelCount');
  const goTodayWrap = document.getElementById('goToTodayBtn');
  if (!panel) return;
  const { totalMin, count, list } = getTotalsForDate(selectedDate);
  if (dateEl) dateEl.textContent = `${selectedDate.getDate()} de ${MONTH_LABELS[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`;
  if (totalEl) totalEl.textContent = minutesToHuman(totalMin);
  if (countEl) countEl.textContent = `${count} ${count===1?'pessoa orou':'pessoas oraram'}`;
  renderParticipants(list);
  panel.classList.remove('hidden');
  // Toggle "Go to today" if not viewing today
  const today = new Date(); today.setHours(0,0,0,0);
  const viewDay = new Date(selectedDate); viewDay.setHours(0,0,0,0);
  if (goTodayWrap){
    if (viewDay.getTime() !== today.getTime()) goTodayWrap.classList.remove('hidden');
    else goTodayWrap.classList.add('hidden');
  }
}
function closeDayPanel(){
  const panel = document.getElementById('dayPanel');
  if (panel) panel.classList.add('hidden');
}
// Daily cards section (existing list for today)
function atualizarPainelDiario(){
  const cardsListEl = document.getElementById('cardsList');
  const emptyStateEl = document.getElementById('emptyState');
  const todayHeaderEl = document.getElementById('todayUniqueCount');
  if (!cardsListEl || !emptyStateEl) return;
  const todayStr = toDateStr(new Date());
  const hoje = allPrayers.filter(p => p.data === todayStr);

  // Build unique participants and earliest/first time per person for display
  const byHour = [...hoje].sort((a,b)=> (a.hora||'').localeCompare(b.hora||''));
  const seen = new Set();
  const uniqueList = [];
  for (const p of byHour){
    const key = (p.nome||'').trim().toLowerCase();
    if (!key) continue;
    if (!seen.has(key)){
      seen.add(key);
      uniqueList.push(p);
    }
  }
  const uniqueCount = seen.size;

  // Update header count above list
  if (todayHeaderEl){
    todayHeaderEl.textContent = `${uniqueCount} ${uniqueCount===1?'pessoa orou hoje':'pessoas oraram hoje'}`;
  }

  cardsListEl.innerHTML = '';
  if (uniqueList.length === 0) {
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
    uniqueList.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/70 border border-amber-200 hover:shadow-md hover:bg-white/80 transition';
      const left = document.createElement('div'); left.className='text-teal-900 font-medium truncate'; left.textContent = p.nome;
      const right = document.createElement('div'); right.className='text-amber-800 font-semibold tabular-nums'; right.textContent = p.hora||'';
      card.appendChild(left); card.appendChild(right);
      cardsListEl.appendChild(card);
    });
  }
}
// Form submit (5 min quick register)
async function registrarOracao(event){
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name){ alert('Por favor, digite seu nome ou apelido.'); return; }
  const now = new Date();
  const { error } = await supabase.from('escala_oracao').insert([{ 
    nome: name,
    data: toDateStr(now),
    hora: now.toTimeString().slice(0,8),
    minutos: 5,
    responsavel: name,
    observacoes: ''
  }]);
  if (error){ alert('Erro ao registrar oração! Tente novamente.'); return; }
  nameInput.value = '';
  await atualizarOracoes();
  atualizarPainelDiario();
  atualizarCardsResumo(new Date());
  buildCalendar();
}
// Navigation buttons
function wireNavigation(){
  const prev = document.getElementById('prevMonth');
  const next = document.getElementById('nextMonth');
  const goToday = document.getElementById('goToToday');
  const closeBtn = document.getElementById('closeDayPanel');
  if (prev) prev.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1); buildCalendar(); });
  if (next) next.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1); buildCalendar(); });
  if (goToday) goToday.addEventListener('click', ()=>{
    selectedDate = new Date();
    currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    buildCalendar();
    openDayPanel(selectedDate);
  });
  if (closeBtn) closeBtn.addEventListener('click', closeDayPanel);
}
// Init
document.addEventListener('DOMContentLoaded', async ()=>{
  await atualizarOracoes();
  wireNavigation();
  atualizarPainelDiario();
  atualizarCardsResumo(new Date());
  buildCalendar();
});
