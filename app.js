import { supabase } from './supabaseClient.js';

// ===== Global State =====
let selectedDate = null;
let currentWeekStart = null;
let allOracoes = [];

// ===== Date Helpers =====
function startOfDaySP(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function isSameDay(d1, d2) {
  return formatDateKey(d1) === formatDateKey(d2);
}

function formatDatePT(date) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${dias[date.getDay()]}, ${date.getDate()} ${meses[date.getMonth()]}`;
}

function getMonthNamePT(date) {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return meses[date.getMonth()];
}

function getWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  return `Semana ${weekStart.getDate()}-${end.getDate()}`;
}

// ===== Fetch Prayers =====
async function atualizarOracoes() {
  try {
    const { data, error } = await supabase
      .from('oracoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar orações:', error);
      return;
    }
    
    allOracoes = data || [];
    console.log('Orações carregadas:', allOracoes.length);
  } catch (err) {
    console.error('Erro ao atualizar orações:', err);
  }
}

// ===== Realtime Subscription =====
function subscribeRealtime() {
  supabase
    .channel('oracoes-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'oracoes' }, (payload) => {
      console.log('Realtime update:', payload);
      atualizarOracoes().then(() => atualizarUI());
    })
    .subscribe();
}

// ===== Daily Panel =====
function atualizarPainelDiario(date) {
  const key = formatDateKey(date);
  const oracoesDia = allOracoes.filter(o => o.data_oracao === key);
  
  const totalMin = oracoesDia.length * 5;
  const totalPessoas = new Set(oracoesDia.map(o => o.nome)).size;
  
  const el = document.querySelector('main');
  if (!el) return;
  
  const parts = el.innerHTML.split('HOJE');
  if (parts.length < 2) return;
  
  const beforeToday = parts[0] + 'HOJE';
  const afterToday = parts[1];
  
  const newHtml = `${totalMin} min${totalPessoas} pessoas`;
  const remaining = afterToday.replace(/\d+ min\d+ pessoas/, newHtml);
  
  el.innerHTML = beforeToday + remaining;
  
  // Update prayer list
  const listaPart = remaining.split('Quem já orou hoje');
  if (listaPart.length > 1) {
    const nomesUnicos = [...new Set(oracoesDia.map(o => o.nome))];
    let listaHtml = `${nomesUnicos.length} pessoas oraram hoje`;
    if (nomesUnicos.length > 0) {
      listaHtml += '<ul>';
      nomesUnicos.forEach(nome => {
        listaHtml += `<li>${nome}</li>`;
      });
      listaHtml += '</ul>';
    }
    
    const beforeLista = remaining.split('Quem já orou hoje')[0];
    const afterLista = remaining.split('Quem já orou hoje')[1];
    const finalHtml = beforeLista + 'Quem já orou hoje' + listaHtml + (afterLista.includes('<div') ? afterLista.substring(afterLista.indexOf('<div')) : '');
    
    el.innerHTML = beforeToday + finalHtml;
  }
}

// ===== Summary Cards =====
function atualizarCardsResumo(date) {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = formatDateKey(weekStart);
  const weekEndKey = formatDateKey(weekEnd);
  
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const monthStartKey = formatDateKey(monthStart);
  const monthEndKey = formatDateKey(monthEnd);
  
  // Week stats
  const oracoesWeek = allOracoes.filter(o => o.data_oracao >= weekStartKey && o.data_oracao <= weekEndKey);
  const weekMin = oracoesWeek.length * 5;
  const weekPessoas = new Set(oracoesWeek.map(o => o.nome)).size;
  
  // Month stats
  const oracoesMonth = allOracoes.filter(o => o.data_oracao >= monthStartKey && o.data_oracao <= monthEndKey);
  const monthMin = oracoesMonth.length * 5;
  const monthPessoas = new Set(oracoesMonth.map(o => o.nome)).size;
  
  const el = document.querySelector('main');
  if (!el) return;
  
  let html = el.innerHTML;
  
  // Update week
  html = html.replace(/ESTA SEMANA\d+ min\d+ pessoas/, `ESTA SEMANA${weekMin} min${weekPessoas} pessoas`);
  
  // Update month
  html = html.replace(/ESTE MÊS\d+ min\d+ pessoas/, `ESTE MÊS${monthMin} min${monthPessoas} pessoas`);
  
  el.innerHTML = html;
}

// ===== Calendar =====
function buildCalendar() {
  const el = document.querySelector('main');
  if (!el) return;
  
  const today = startOfDaySP(new Date());
  const monthName = getMonthNamePT(currentWeekStart || today);
  const year = (currentWeekStart || today).getFullYear();
  const weekRange = getWeekRange(currentWeekStart || startOfWeek(today));
  
  let html = el.innerHTML;
  
  // Update month/year display
  const monthRegex = /(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+\d{4}/;
  html = html.replace(monthRegex, `${monthName} ${year}`);
  
  // Update week range
  const weekRegex = /Semana \d+-\d+/;
  html = html.replace(weekRegex, weekRange);
  
  el.innerHTML = html;
}

// ===== Navigation =====
function wireNavigation() {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(btn => {
    const text = btn.textContent.trim();
    
    if (text === 'Próximo mês') {
      btn.onclick = () => {
        currentWeekStart = addMonths(currentWeekStart, 1);
        selectedDate = currentWeekStart;
        atualizarUI();
      };
    } else if (text === 'Mês anterior') {
      btn.onclick = () => {
        currentWeekStart = addMonths(currentWeekStart, -1);
        selectedDate = currentWeekStart;
        atualizarUI();
      };
    } else if (text === 'Próximo ano') {
      btn.onclick = () => {
        currentWeekStart = addMonths(currentWeekStart, 12);
        selectedDate = currentWeekStart;
        atualizarUI();
      };
    } else if (text === 'Ano anterior') {
      btn.onclick = () => {
        currentWeekStart = addMonths(currentWeekStart, -12);
        selectedDate = currentWeekStart;
        atualizarUI();
      };
    }
  });
}

// ===== Register Prayer =====
async function registrarOracao(e) {
  e.preventDefault();
  
  const input = document.querySelector('input[aria-label="Seu nome ou apelido"]');
  if (!input) return;
  
  const nome = input.value.trim();
  if (!nome) {
    alert('Por favor, digite seu nome ou apelido.');
    return;
  }
  
  const hoje = formatDateKey(startOfDaySP(new Date()));
  
  try {
    const { error } = await supabase
      .from('oracoes')
      .insert([{ nome, data_oracao: hoje, minutos: 5 }]);
    
    if (error) {
      console.error('Erro ao registrar oração:', error);
      alert('Erro ao registrar oração. Tente novamente.');
      return;
    }
    
    input.value = '';
    await atualizarOracoes();
    atualizarUI();
    
    // Show success message
    const liveRegion = document.querySelector('div[aria-live="polite"]');
    if (liveRegion) {
      liveRegion.textContent = `Oração registrada! Obrigado, ${nome}!`;
      setTimeout(() => { liveRegion.textContent = ''; }, 3000);
    }
  } catch (err) {
    console.error('Erro ao registrar oração:', err);
    alert('Erro ao registrar oração. Tente novamente.');
  }
}

// ===== Update UI =====
function atualizarUI() {
  if (!selectedDate) selectedDate = startOfDaySP(new Date());
  if (!currentWeekStart) currentWeekStart = startOfWeek(selectedDate);
  
  atualizarPainelDiario(selectedDate);
  atualizarCardsResumo(selectedDate);
  buildCalendar();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  selectedDate = startOfDaySP(new Date());
  currentWeekStart = startOfWeek(selectedDate);
  
  await atualizarOracoes();
  subscribeRealtime();
  wireNavigation();
  atualizarUI();
  
  const form = document.getElementById('prayerForm');
  if (form) form.addEventListener('submit', registrarOracao);
});
