import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase client
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);

// ===== Timezone helpers (America/Sao_Paulo) =====
const TZ = 'America/Sao_Paulo';
function toSaopauloDate(d = new Date()) {
  // get local time in Sao Paulo by formatting parts and reconstructing
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  // parts.day/month/year in pt-BR order
  return new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
}
function toDateStr(d) {
  const sp = toSaopauloDate(d);
  const y = sp.getFullYear();
  const m = String(sp.getMonth() + 1).padStart(2, '0');
  const day = String(sp.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function toTimeStr(d) {
  const sp = toSaopauloDate(d);
  const hh = String(sp.getHours()).padStart(2, '0');
  const mm = String(sp.getMinutes()).padStart(2, '0');
  const ss = String(sp.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
function startOfDaySP(d) {
  const sp = toSaopauloDate(d);
  sp.setHours(0,0,0,0);
  return sp;
}
function endOfDaySP(d) {
  const sp = toSaopauloDate(d);
  sp.setHours(23,59,59,999);
  return sp;
}

// ===== State =====
let currentMonth = startOfDaySP(new Date());
currentMonth.setDate(1);
let selectedDate = startOfDaySP(new Date());

// ===== Labels =====
const WEEKDAY_LABELS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTH_LABELS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function minutesToHuman(min){
  return min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min} min`;
}
function startOfWeek(d){
  const x = new Date(d);
  const day = (x.getDay()+7)%7;
  x.setDate(x.getDate()-day);
  x.setHours(0,0,0,0);
  return x;
}
function endOfWeek(d){
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate()+6);
  e.setHours(23,59,59,999);
  return e;
}
function startOfMonth(d){
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0,0,0,0);
  return x;
}
function endOfMonth(d){
  const x = new Date(d.getFullYear(), d.getMonth()+1, 0);
  x.setHours(23,59,59,999);
  return x;
}

// ===== Data cache =====
let allPrayers = [];
async function atualizarOracoes(){
  const { data, error } = await supabase.from('escala_oracao').select('*');
  if (error) { console.error(error); return; }
  allPrayers = data || [];
}

// ===== Aggregations =====
function getTotalsForDate(date){
  const ds = toDateStr(date);
  const list = allPrayers.filter(p => p.data === ds);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: list.length, list };
}
function getTotalsForRange(start, end){
  const s = toDateStr(start);
  const e = toDateStr(end);
  const list = allPrayers.filter(p => p.data >= s && p.data <= e);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: new Set(list.map(p=>p.nome)).size };
}
function getTotalsForMonth(d){ return getTotalsForRange(startOfMonth(d), endOfMonth(d)); }
function getTotalsForWeek(d){ return getTotalsForRange(startOfWeek(d), endOfWeek(d)); }

// ===== UI: Stats cards =====
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
  if (tc) tc.textContent = `${getTotalsForDate(baseDate).count} pessoas`;
  if (wc) wc.textContent = `${weekCount} pessoas`;
  if (mc) mc.textContent = `${monthCount} pessoas`;
}

// ===== UI: Today panel =====
function atualizarPainelDiario(){
  const todayStr = toDateStr(new Date());
  const panel = document.getElementById('todayPrayersPanel');
  const listEl = document.getElementById('todayPrayersList');
  if (!panel || !listEl) return;
  const todayList = allPrayers.filter(p => p.data === todayStr);
  const uniqueByName = new Map();
  // Keep latest record per person by hora
  todayList.forEach(p => {
    const existing = uniqueByName.get(p.nome);
    if (!existing || (p.hora||'') > (existing.hora||'')) uniqueByName.set(p.nome, p);
  });
  const uniqueList = Array.from(uniqueByName.values()).sort((a,b)=> (a.hora||'').localeCompare(b.hora||''));
  listEl.innerHTML = '';
  if (uniqueList.length === 0){
    const p = document.createElement('p');
    p.className = 'text-sm text-teal-600 text-center col-span-full';
    p.textContent = 'Nenhum registro ainda hoje.';
    listEl.appendChild(p);
    return;
  }
  uniqueList.forEach(p => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/70 border border-amber-200 hover:shadow-md hover:bg-white/80 transition';
    const left = document.createElement('div');
    left.className = 'text-teal-900 font-medium truncate';
    left.textContent = p.nome;
    const right = document.createElement('div');
    right.className = 'text-amber-800 font-semibold tabular-nums';
    right.textContent = p.hora || '';
    card.append(left, right);
    listEl.appendChild(card);
  });
}

// ===== Calendar =====
function buildCalendar(){
  const daysGrid = document.getElementById('calendarDays');
  const monthTitle = document.getElementById('calendarMonth');
  if (!daysGrid || !monthTitle) return;

  const base = new Date(currentMonth);
  const month = base.getMonth();
  const year = base.getFullYear();
  monthTitle.textContent = `${MONTH_LABELS[month]} ${year}`;

  // Determine first weekday
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0..6
  const daysInMonth = new Date(year, month+1, 0).getDate();

  daysGrid.innerHTML = '';

  // Leading blanks
  for (let i=0;i<startWeekday;i++){
    const ph = document.createElement('div');
    ph.setAttribute('aria-hidden', 'true');
    daysGrid.appendChild(ph);
  }

  const todayStr = toDateStr(new Date());
  for (let day=1; day<=daysInMonth; day++){
    const d = new Date(year, month, day);
    const ds = toDateStr(d);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `aspect-square w-full rounded-md text-sm md:text-base flex items-center justify-center border ${ds===todayStr? 'bg-amber-100 border-amber-300 font-semibold':'bg-white/70 border-amber-200 hover:bg-white'}`;
    btn.textContent = String(day);
    btn.setAttribute('aria-label', `${day} de ${MONTH_LABELS[month]} de ${year}`);
    btn.addEventListener('click', ()=> openDayPanel(d));
    daysGrid.appendChild(btn);
  }
}

function openDayPanel(date){
  selectedDate = startOfDaySP(date);
  const panel = document.getElementById('selectedDayPanel');
  const title = document.getElementById('selectedDayTitle');
  const list = document.getElementById('selectedDayList');
  if (!panel || !title || !list) return;
  const ds = toDateStr(selectedDate);
  title.textContent = `📅 Orações de ${ds}`;
  panel.classList.remove('hidden');
  list.innerHTML='';
  const items = allPrayers.filter(p=> p.data===ds).sort((a,b)=> (a.hora||'').localeCompare(b.hora||''));
  if (items.length===0){
    const p = document.createElement('p');
    p.className = 'text-sm text-amber-600 text-center col-span-full';
    p.textContent = 'Nenhum registro neste dia.';
    list.appendChild(p);
    return;
  }
  items.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/70 border border-amber-200';
    const left = document.createElement('div');
    left.className = 'text-teal-900 font-medium truncate';
    left.textContent = p.nome;
    const right = document.createElement('div');
    right.className = 'text-amber-800 font-semibold tabular-nums';
    right.textContent = p.hora || '';
    card.append(left,right);
    list.appendChild(card);
  });
}
function closeDayPanel(){
  const panel = document.getElementById('selectedDayPanel');
  if (panel) panel.classList.add('hidden');
}

// ===== Form submit (5 min quick register) =====
async function registrarOracao(event){
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name){ alert('Por favor, digite seu nome ou apelido.'); return; }
  const now = new Date();
  const { error } = await supabase.from('escala_oracao').insert([
    {
      nome: name,
      data: toDateStr(now),
      hora: toTimeStr(now),
      minutos: 5,
      responsavel: name,
      observacoes: ''
    }
  ]);
  if (error){ alert('Erro ao registrar oração! Tente novamente.'); return; }
  nameInput.value = '';
  await atualizarOracoes();
  atualizarPainelDiario();
  atualizarCardsResumo(startOfDaySP(new Date()));
  buildCalendar();
}

// ===== Navigation buttons =====
function wireNavigation(){
  const prev = document.getElementById('prevMonth');
  const next = document.getElementById('nextMonth');
  const goToday = document.getElementById('goToToday');
  const closeBtn = document.getElementById('closeDayPanel');
  if (prev) prev.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1); buildCalendar(); });
  if (next) next.addEventListener('click', ()=>{ currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1); buildCalendar(); });
  if (goToday) goToday.addEventListener('click', ()=>{ selectedDate = startOfDaySP(new Date()); currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); buildCalendar(); openDayPanel(selectedDate); });
  if (closeBtn) closeBtn.addEventListener('click', closeDayPanel);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async ()=>{
  await atualizarOracoes();
  wireNavigation();
  atualizarPainelDiario();
  atualizarCardsResumo(startOfDaySP(new Date()));
  buildCalendar();
  const form = document.getElementById('prayerForm');
  if (form) form.addEventListener('submit', registrarOracao);
});
