// ============================================
// ESCALA DE ORAÇÃO - APPLICATION LOGIC
// ============================================

// Import Supabase client
import supabase from "./supabaseClient.js";

// Data Management
async function registrarOracao() {
  const nome = document.getElementById("nameInput").value;
  const responsavel = "Web Anônimo";
  const hoje = new Date();

  const { error } = await supabase.from("escala_oracao").insert([{
    nome,
    data: hoje.toISOString().substring(0, 10),
    hora: hoje.toTimeString().substring(0, 8),
    responsavel,
    observacoes: ""
  }]);

  if (error) {
    alert("Erro ao registrar: " + error.message);
  } else {
    alert("Oração registrada com sucesso!");
    await atualizarOracoes();
  }
}

// DataManager via Supabase
const DataManager = {
  // Adiciona uma oração no banco
  async addPrayer(date, name) {
    const { data, error } = await supabase
      .from('escala_oracao')
      .insert([{
        nome: name.trim(),
        data: date.toISOString().slice(0,10),
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        responsavel: name.trim(),
        observacoes: ''
      }]);
    return { data, error };
  },

  // Busca orações de um dia
  async getPrayersForDate(date) {
    const dateStr = date.toISOString().slice(0,10);
    let { data, error } = await supabase
      .from('escala_oracao')
      .select('*')
      .eq('data', dateStr);
    // Adapta para ["name"]
    return (data || []).map(item => ({ name: item.nome }));
  },

  // Busca os dias do mês que têm oração
  async getDatesWithPrayersInMonth(year, month) {
    const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const endDate = `${year}-${String(month+1).padStart(2,'0')}-31`;
    let { data, error } = await supabase
      .from('escala_oracao')
      .select('data')
      .gte('data', startDate)
      .lte('data', endDate);
    if (error) {
      console.error('Erro ao buscar datas:', error);
      return [];
    }
    return [...new Set((data || []).map(item => item.data))];
  },

  // Remove uma oração
  async removePrayer(date, name) {
    const dateStr = date.toISOString().slice(0,10);
    const { error } = await supabase
      .from('escala_oracao')
      .delete()
      .eq('data', dateStr)
      .eq('nome', name);
    return { error };
  }
};

// ============================================
// CALENDAR & UI LOGIC
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Atualiza o calendário
async function updateCalendar() {
  const monthNameEl = document.getElementById('monthName');
  monthNameEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const datesWithPrayers = await DataManager.getDatesWithPrayersInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';

  // Preenche células vazias
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyCell);
  }

  // Preenche os dias
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.textContent = day;

    const currentDate = new Date(currentYear, currentMonth, day);
    const dateStr = currentDate.toISOString().slice(0,10);

    if (datesWithPrayers.includes(dateStr)) {
      dayCell.classList.add('has-prayer');
    }

    const today = new Date();
    if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      dayCell.classList.add('today');
    }

    dayCell.addEventListener('click', () => selectDate(currentDate));
    calendarGrid.appendChild(dayCell);
  }
}

// Seleciona uma data
async function selectDate(date) {
  selectedDate = date;
  document.querySelectorAll('.calendar-day').forEach(cell => {
    cell.classList.remove('selected');
  });
  event.target.classList.add('selected');

  const prayers = await DataManager.getPrayersForDate(date);
  displayPrayers(prayers);
}

// Exibe orações do dia
function displayPrayers(prayers) {
  const prayerList = document.getElementById('prayerList');
  const dateDisplay = document.getElementById('selectedDate');

  if (selectedDate) {
    dateDisplay.textContent = selectedDate.toLocaleDateString('pt-BR');
  }

  if (!prayers || prayers.length === 0) {
    prayerList.innerHTML = '<p class="no-prayers">Nenhuma oração registrada neste dia.</p>';
    return;
  }

  prayerList.innerHTML = '';
  prayers.forEach(prayer => {
    const prayerItem = document.createElement('div');
    prayerItem.className = 'prayer-item';
    prayerItem.innerHTML = `
      <span>${prayer.name}</span>
      <button onclick="removePrayer('${prayer.name}')">Remover</button>
    `;
    prayerList.appendChild(prayerItem);
  });
}

// Adiciona oração
async function addPrayer() {
  const input = document.getElementById('prayerInput');
  const name = input.value.trim();

  if (!name) {
    alert('Por favor, insira um nome.');
    return;
  }

  if (!selectedDate) {
    alert('Por favor, selecione uma data no calendário.');
    return;
  }

  const { error } = await DataManager.addPrayer(selectedDate, name);

  if (error) {
    alert('Erro ao adicionar oração: ' + error.message);
  } else {
    input.value = '';
    await updateCalendar();
    await selectDate(selectedDate);
  }
}

// Remove oração
async function removePrayer(name) {
  if (!selectedDate) return;

  const { error } = await DataManager.removePrayer(selectedDate, name);

  if (error) {
    alert('Erro ao remover oração: ' + error.message);
  } else {
    await updateCalendar();
    await selectDate(selectedDate);
  }
}

// Atualiza orações (chamada externa)
async function atualizarOracoes() {
  await updateCalendar();
  if (selectedDate) {
    const prayers = await DataManager.getPrayersForDate(selectedDate);
    displayPrayers(prayers);
  }
}

// Navegação do calendário
function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  updateCalendar();
});

// Exporta funções globais
window.addPrayer = addPrayer;
window.removePrayer = removePrayer;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.registrarOracao = registrarOracao;
