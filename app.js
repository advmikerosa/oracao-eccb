import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Supabase client
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);
// ===== Timezone helpers (America/Sao_Paulo) =====
const TZ = 'America/Sao_Paulo';
function toSaopauloDate(d = new Date()){
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return new Date(
    Number(parts.year), Number(parts.month)-1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
}
function toDateStr(d){
  const sp = toSaopauloDate(d);
  const y = sp.getFullYear();
  const m = String(sp.getMonth()+1).padStart(2,'0');
  const day = String(sp.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function toTimeStr(d){
  const sp = toSaopauloDate(d);
  const hh = String(sp.getHours()).padStart(2,'0');
  const mm = String(sp.getMinutes()).padStart(2,'0');
  const ss = String(sp.getSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}
function startOfDaySP(d){ const sp = toSaopauloDate(d); sp.setHours(0,0,0,0); return sp; }
function endOfDaySP(d){ const sp = toSaopauloDate(d); sp.setHours(23,59,59,999); return sp; }
// ===== Helpers =====
function minutesToHuman(min){ return min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min} min`; }
function startOfWeek(d){ const x = new Date(d); const day = (x.getDay()+7)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
function endOfWeek(d){ const s = startOfWeek(d); const e = new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
// ===== State =====
let currentWeekStart = startOfWeek(startOfDaySP(new Date()));
let selectedDate = startOfDaySP(new Date());
// ===== Labels =====
const WEEKDAY_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_LABELS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
// ===== Data cache =====
let allPrayers = [];
async function atualizarOracoes(){
  const { data, error } = await supabase.from('escala_oracao').select('*');
  if (error){ console.error(error); return; }
  allPrayers = data || [];
}
function subscribeRealtime(){
  try{
    supabase.channel('escala_oracao_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escala_oracao' }, async () => {
        await atualizarOracoes();
        atualizarUI();
      })
      .subscribe();
  }catch(e){ console.error('Realtime subscription error', e); }
}
// ===== Aggregations =====
function getTotalsForDate(date){
  const ds = toDateStr(date);
  const list = allPrayers.filter(p => p.data === ds);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: new Set(list.map(p=>p.nome)).size, list };
}
function getTotalsForRange(start, end){
  const s = toDateStr(start);
  const e = toDateStr(end);
  const list = allPrayers.filter(p => p.data >= s && p.data <= e);
  const totalMin = list.reduce((acc,p)=> acc + (p.minutos || 5), 0);
  return { totalMin, count: new Set(list.map(p=>p.nome)).size };
}
function getTotalsForMonth(d){
  const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const mEnd = new Date(d.getFullYear(), d.getMonth()+1, 0);
  return getTotalsForRange(mStart, mEnd);
}
function getTotalsForWeek(d){ return getTotalsForRange(startOfWeek(d), endOfWeek(d)); }
// ===== UI: Stats cards (today/week/month) =====
function atualizarCardsResumo(baseDate){
  const { totalMin: todayMin, count: todayCount } = getTotalsForDate(baseDate);
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
  if (tc) tc.textContent = `${todayCount} pessoas`;
  if (wc) wc.textContent = `${weekCount} pessoas`;
  if (mc) mc.textContent = `${monthCount} pessoas`;
}
// ===== UI: Painel do dia =====
function atualizarPainelDiario(){
  const todayStr = toDateStr(new Date());
  const panel = document.getElementById('todayPrayersPanel');
  const listEl = document.getElementById('todayPrayersList');
  const cardsEl = document.getElementById('cardsList');
  if (!panel || !listEl) return;
  const todayList = allPrayers.filter(p => p.data === todayStr);
  const uniqueByName = new Map();
  todayList.forEach(p => {
    const existing = uniqueByName.get(p.nome);
    if (!existing || (p.hora||'') > (existing.hora||'')) uniqueByName.set(p.nome, p);
  });
  const uniqueList = Array.from(uniqueByName.values()).sort((a,b)=> (a.hora||'').localeCompare(b.hora||''));
  listEl.innerHTML = '';
  if (cardsEl) cardsEl.innerHTML = '';
  if (uniqueList.length === 0){
    const p = document.createElement('p');
    p.className = 'text-sm text-blue-700 text-center col-span-full';
    p.textContent = 'Nenhum registro ainda hoje.';
    listEl.appendChild(p);
    if (cardsEl) cardsEl.appendChild(p.cloneNode(true));
    return;
  }
  uniqueList.forEach(p => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/80 border border-blue-200 hover:shadow-md hover:bg-white transition';
    const left = document.createElement('div');
    left.className = 'text-blue-900 font-medium truncate';
    left.textContent = p.nome;
    const right = document.createElement('div');
    right.className = 'text-blue-800 font-semibold tabular-nums';
    right.textContent = p.hora || '';
    card.append(left, right);
    listEl.appendChild(card);
    if (cardsEl) cardsEl.appendChild(card.cloneNode(true));
  });
  const totalMin = todayList.reduce((acc,x)=> acc + (x.minutos || 5), 0);
  const totalEl = document.getElementById('todaySummaryTotal');
  if (totalEl) totalEl.textContent = minutesToHuman(totalMin);
}
// ===== Calendar (Semana compacta) =====
function buildCalendar(){
  const daysGrid = document.getElementById('calendarDays');
  const monthTitle = document.getElementById('calendarMonth');
  if (!daysGrid || !monthTitle) return;
  // Calculate current week range
  const start = startOfWeek(currentWeekStart);
  const end = endOfWeek(currentWeekStart);
  // Title: Mês/ano e intervalo da semana
  const rangeLabel = `${String(start.getDate()).padStart(2,'0')}/${String(start.getMonth()+1).padStart(2,'0')} – ${String(end.getDate()).padStart(2,'0')}/${String(end.getMonth()+1).padStart(2,'0')}`;
  monthTitle.textContent = `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()} · Semana ${rangeLabel}`;
  // Render 7 compact day buttons
  daysGrid.innerHTML = '';
  daysGrid.className = 'grid grid-cols-7 gap-2 sm:gap-3';
  const todayStr = toDateStr(new Date());
  for (let i=0;i<7;i++){
    const d = addDays(start, i);
    const ds = toDateStr(d);
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center gap-1';
    const label = document.createElement('div');
    label.className = 'text-[11px] sm:text-xs text-blue-700';
    label.textContent = WEEKDAY_LABELS[(d.getDay()+7)%7];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `w-full rounded-md px-0.5 py-2 text-sm sm:text-base border ${ds===todayStr? 'bg-blue-100 border-blue-300 font-semibold':'bg-white/80 border-blue-200 hover:bg-white'} `;
    btn.textContent = String(d.getDate());
    btn.setAttribute('aria-label', `${d.getDate()} de ${MONTH_LABELS[d.getMonth()]} de ${d.getFullYear()}`);
    btn.addEventListener('click', ()=> openDayPanel(d));
    container.append(label, btn);
    daysGrid.appendChild(container);
  }
  // Update summary for the visible week (optional future enhancement)
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
    p.className = 'text-sm text-blue-700 text-center col-span-full';
    p.textContent = 'Nenhum registro neste dia.';
    list.appendChild(p);
    return;
  }
  items.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/80 border border-blue-200';
    const left = document.createElement('div');
    left.className = 'text-blue-900 font-medium truncate';
    left.textContent = p.nome;
    const right = document.createElement('div');
    right.className = 'text-blue-800 font-semibold tabular-nums';
    right.textContent = p.hora || '';
    card.append(left,right);
    list.appendChild(card);
  });
}
function closeDayPanel(){
  const panel = document.getElementById('selectedDayPanel');
  if (panel) panel.classList.add('hidden');
}
// ===== Registrar rápido =====
async function registrarOracao(event){
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name){ alert('Por favor, digite seu nome ou apelido.'); return; }
  const now = new Date();
  const { error } = await supabase.from('escala_oracao').insert([
    { nome: name, data: toDateStr(now), hora: toTimeStr(now), minutos: 5, responsavel: name, observacoes: '' }
  ]);
  if (error){ alert('Erro ao registrar oração! Tente novamente.'); return; }
  nameInput.value = '';
  await atualizarOracoes();
  atualizarUI();
}
// ===== Navegação (semanas) =====
function wireNavigation(){
  const prev = document.getElementById('prevMonth'); // reutilizando ids existentes
  const next = document.getElementById('nextMonth');
  const goToday = document.getElementById('goToToday');
  const closeBtn = document.getElementById('closeDayPanel');
  if (prev) prev.addEventListener('click', ()=>{ currentWeekStart = addDays(currentWeekStart, -7); buildCalendar(); });
  if (next) next.addEventListener('click', ()=>{ currentWeekStart = addDays(currentWeekStart, 7); buildCalendar(); });
  if (goToday) goToday.addEventListener('click', ()=>{ selectedDate = startOfDaySP(new Date()); currentWeekStart = startOfWeek(selectedDate); buildCalendar(); openDayPanel(selectedDate); });
  if (closeBtn) closeBtn.addEventListener('click', closeDayPanel);
}
// ===== Atualiza UI =====
function atualizarUI(){
  atualizarPainelDiario();
  atualizarCardsResumo(startOfDaySP(new Date()));
  buildCalendar();
}
// ===== Init =====
document.addEventListener('DOMContentLoaded', async ()=>{
  await atualizarOracoes();
  subscribeRealtime();
  wireNavigation();
  atualizarUI();
  const form = document.getElementById('prayerForm');
  if (form) form.addEventListener('submit', registrarOracao);
});
